import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { api, toJournalRecord } from "../lib/api";
import { processJournalOperations, type JournalSyncResult } from "../lib/journal-sync";
import { contentCacheKeys, loadDeviceCache, removeDeviceCache, saveDeviceCache } from "../storage/device-cache";
import { removeJournalDraft } from "../storage/journal-drafts";
import {
  loadJournalOperations,
  makeJournalOperationId,
  mergeJournalOperations,
  restoreJournalOperationsAfterUndo,
  saveJournalOperations,
  upsertJournalOperation,
  type JournalOperation
} from "../storage/journal-operations";
import { useSession } from "./SessionContext";
import { enqueuePendingSync, removePendingJournal } from "../storage/pending-sync";
import type { AppRoute, JournalRecord, PageName, ScreeningResult } from "../types/content";

const LEGACY_JOURNAL_CACHE_KEY = "native.journal.records";
const LEGACY_SCREENING_CACHE_KEY = "native.screening.results";
export const STACK_TRANSITION_MS = 280;

type AppContextValue = {
  isGuest: boolean;
  isLoading: boolean;
  route: AppRoute;
  stack: AppRoute[];
  backTransitionKey: string | null;
  journalRecords: JournalRecord[];
  journalOwner: string;
  pendingJournalDeletion: { record: JournalRecord; expiresAt: string } | null;
  screeningResults: ScreeningResult[];
  navigate: (page: PageName, params?: Record<string, unknown>) => void;
  goBack: () => void;
  resetTo: (page: PageName, params?: Record<string, unknown>) => void;
  saveJournal: (input: { date: string; emotions: string[]; body: string }) => Promise<JournalRecord>;
  retryJournal: (date: string) => Promise<void>;
  deleteJournal: (record: JournalRecord) => Promise<void>;
  undoJournalDelete: () => Promise<void>;
  saveScreening: (answers: Record<string, string>, localResult: ScreeningResult) => Promise<ScreeningResult>;
  clearContent: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const AppRouteContext = createContext<AppRoute | null>(null);

export function AppProvider({ children, isGuest }: { children: React.ReactNode; isGuest: boolean }) {
  const { session, contentRevision } = useSession();
  const cacheOwner = session?.userId ?? "guest";
  const activeOwnerRef = useRef(cacheOwner);
  activeOwnerRef.current = cacheOwner;
  const [journalCacheKey, screeningCacheKey] = contentCacheKeys(cacheOwner);
  const routeSequence = useRef(0);
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [stack, setStack] = useState<AppRoute[]>([{ key: "route:0", page: "home" }]);
  const [backTransitionKey, setBackTransitionKey] = useState<string | null>(null);
  const [journalRecords, setJournalRecords] = useState<JournalRecord[]>([]);
  const journalRecordsRef = useRef<JournalRecord[]>([]);
  const journalOperationsRef = useRef<JournalOperation[]>([]);
  const syncInFlight = useRef<Promise<JournalSyncResult> | null>(null);
  const queueWriteInFlight = useRef<Promise<void> | null>(null);
  const [pendingJournalDeletion, setPendingJournalDeletion] = useState<{ record: JournalRecord; expiresAt: string } | null>(null);
  const [screeningResults, setScreeningResults] = useState<ScreeningResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const persist = useCallback(async (journals: JournalRecord[], screenings: ScreeningResult[]) => {
    await Promise.all([
      saveDeviceCache(journalCacheKey, journals),
      saveDeviceCache(screeningCacheKey, screenings)
    ]);
  }, [journalCacheKey, screeningCacheKey]);

  const setAndPersistJournals = useCallback(async (journals: JournalRecord[]) => {
    journalRecordsRef.current = journals;
    setJournalRecords(journals);
    await saveDeviceCache(journalCacheKey, journals);
  }, [journalCacheKey]);

  const persistJournalOperations = useCallback(async (operations: JournalOperation[]) => {
    const write = saveJournalOperations(cacheOwner, operations);
    queueWriteInFlight.current = write;
    try {
      await write;
    } finally {
      if (queueWriteInFlight.current === write) queueWriteInFlight.current = null;
    }
  }, [cacheOwner]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      journalRecordsRef.current = [];
      journalOperationsRef.current = [];
      setJournalRecords([]);
      setPendingJournalDeletion(null);
      let [cachedJournals, cachedScreenings, operations] = await Promise.all([
        loadDeviceCache<JournalRecord[]>(journalCacheKey),
        loadDeviceCache<ScreeningResult[]>(screeningCacheKey),
        loadJournalOperations(cacheOwner)
      ]);

      if (!session && (!cachedJournals || !cachedScreenings)) {
        const [legacyJournals, legacyScreenings] = await Promise.all([
          loadDeviceCache<JournalRecord[]>(LEGACY_JOURNAL_CACHE_KEY),
          loadDeviceCache<ScreeningResult[]>(LEGACY_SCREENING_CACHE_KEY)
        ]);
        cachedJournals = cachedJournals ?? legacyJournals;
        cachedScreenings = cachedScreenings ?? legacyScreenings;
        await Promise.all([
          saveDeviceCache(journalCacheKey, cachedJournals ?? []),
          saveDeviceCache(screeningCacheKey, cachedScreenings ?? []),
          removeDeviceCache(LEGACY_JOURNAL_CACHE_KEY),
          removeDeviceCache(LEGACY_SCREENING_CACHE_KEY)
        ]);
      }

      if (mounted) {
        const normalized = (cachedJournals ?? []).map((record) => normalizeJournalRecord(record, session ? "synced" : "local"));
        journalOperationsRef.current = operations;
        journalRecordsRef.current = mergeJournalOperations(normalized, operations);
        setJournalRecords(journalRecordsRef.current);
        setScreeningResults(cachedScreenings ?? []);
        const undoableDelete = operations.find((operation) =>
          operation.kind === "delete" && operation.notBefore && Date.parse(operation.notBefore) > Date.now()
        );
        setPendingJournalDeletion(undoableDelete
          ? { record: undoableDelete.record, expiresAt: undoableDelete.notBefore! }
          : null);
      }

      if (session) {
        const [serverJournals, serverScreenings] = await Promise.all([
          api.getJournalHistory(70).catch(() => null),
          api.getScreeningHistory().catch(() => null)
        ]);

        if (mounted && serverJournals) {
          const mapped = mergeJournalOperations(serverJournals.map(toJournalRecord), operations);
          journalRecordsRef.current = mapped;
          setJournalRecords(mapped);
          await saveDeviceCache(journalCacheKey, mapped);
        }

        if (mounted && serverScreenings) {
          const mapped = serverScreenings.map((result, index) => ({
            id: `screening:${result.completedDate}:${index}`,
            completedDate: result.completedDate,
            publicSummary: result.publicSummary,
            publicComfortMessage: "오늘 내 마음을 돌아본 것만으로도 충분히 의미 있어요.",
            recommendedActions: [],
            recommendedRescreenAt: result.recommendedRescreenAt,
            requiresSafetyPrompt: result.requiresSafetyPrompt,
            comparisonScore: result.comparisonScore
          }));
          setScreeningResults(mapped);
          await saveDeviceCache(screeningCacheKey, mapped);
        }
      }

    }

    void load()
      .catch(() => undefined)
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [cacheOwner, contentRevision, journalCacheKey, screeningCacheKey, session]);

  useEffect(() => () => {
    if (popTimer.current) clearTimeout(popTimer.current);
  }, []);

  const createRoute = useCallback((page: PageName, params?: Record<string, unknown>): AppRoute => {
    routeSequence.current += 1;
    return { key: `route:${routeSequence.current}`, page, params };
  }, []);

  const navigate = useCallback((page: PageName, params?: Record<string, unknown>) => {
    setStack((current) => [...current, createRoute(page, params)]);
  }, [createRoute]);

  const goBack = useCallback(() => {
    if (stack.length <= 1 || backTransitionKey) return;
    const leavingKey = stack[stack.length - 1].key;
    setBackTransitionKey(leavingKey);
    popTimer.current = setTimeout(() => {
      setStack((current) => current[current.length - 1]?.key === leavingKey ? current.slice(0, -1) : current);
      setBackTransitionKey(null);
      popTimer.current = null;
    }, STACK_TRANSITION_MS);
  }, [backTransitionKey, stack]);

  const resetTo = useCallback((page: PageName, params?: Record<string, unknown>) => {
    setStack([createRoute(page, params)]);
  }, [createRoute]);

  const runJournalSync = useCallback(async (options: { automatic: boolean; date?: string }) => {
    if (!session) return null;
    while (queueWriteInFlight.current || syncInFlight.current) {
      if (queueWriteInFlight.current) await queueWriteInFlight.current;
      if (syncInFlight.current) await syncInFlight.current;
    }

    const owner = cacheOwner;
    const promise = processJournalOperations(owner, options);
    syncInFlight.current = promise;
    try {
      const result = await promise;
      if (activeOwnerRef.current !== owner) return result;

      journalOperationsRef.current = result.operations;
      let next = journalRecordsRef.current
        .filter((record) => !result.deletedDates.includes(record.date));
      for (const saved of result.savedRecords) {
        next = [saved, ...next.filter((record) => record.date !== saved.date)];
      }
      await setAndPersistJournals(mergeJournalOperations(next, result.operations));
      return result;
    } finally {
      if (syncInFlight.current === promise) syncInFlight.current = null;
    }
  }, [cacheOwner, session, setAndPersistJournals]);

  const saveJournal = useCallback(async (input: { date: string; emotions: string[]; body: string }) => {
    let record: JournalRecord;
    if (session) {
      while (syncInFlight.current) await syncInFlight.current;
      const existing = journalRecordsRef.current.find((item) => item.date === input.date);
      record = {
        id: `journal:${input.date}`,
        ...input,
        comfortMessage: existing?.comfortMessage ?? generateComfort(input.emotions),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        version: existing?.version ?? -1,
        syncStatus: "pending"
      };
      const operation: JournalOperation = {
        id: makeJournalOperationId("save", input.date),
        kind: "save",
        date: input.date,
        record,
        expectedVersion: record.version,
        status: "pending",
        retryable: true,
        attempts: 0
      };
      const operations = upsertJournalOperation(journalOperationsRef.current, operation);
      journalOperationsRef.current = operations;
      await persistJournalOperations(operations);
      await setAndPersistJournals(mergeJournalOperations(journalRecordsRef.current, operations));

      const result = await runJournalSync({ automatic: false, date: input.date });
      const remaining = result?.operations.find((item) => item.date === input.date);
      if (remaining) throw new Error(remaining.message ?? "기록을 아직 서버에 저장하지 못했어요.");
      record = journalRecordsRef.current.find((item) => item.date === input.date) ?? record;
    } else {
      record = {
        id: `journal:${input.date}`,
        ...input,
        comfortMessage: generateComfort(input.emotions),
        createdAt: new Date().toISOString(),
        version: -1,
        syncStatus: "local"
      };
      await enqueuePendingSync({ id: record.id, type: "journal", payload: input });
      await removeJournalDraft(cacheOwner, input.date);
      await setAndPersistJournals([record, ...journalRecordsRef.current.filter((item) => item.date !== record.date)]);
    }
    return record;
  }, [cacheOwner, persistJournalOperations, runJournalSync, session, setAndPersistJournals]);

  const retryJournal = useCallback(async (date: string) => {
    const result = await runJournalSync({ automatic: false, date });
    const remaining = result?.operations.find((item) => item.date === date);
    if (remaining) throw new Error(remaining.message ?? "다시 저장하지 못했어요.");
  }, [runJournalSync]);

  const deleteJournal = useCallback(async (record: JournalRecord) => {
    while (syncInFlight.current) await syncInFlight.current;
    const expiresAt = new Date(Date.now() + 5_000).toISOString();
    const operation: JournalOperation = {
      id: makeJournalOperationId("delete", record.date),
      kind: "delete",
      date: record.date,
      record,
      expectedVersion: record.version,
      status: "pending",
      retryable: true,
      notBefore: expiresAt,
      attempts: 0
    };
    const operations = upsertJournalOperation(journalOperationsRef.current, operation);
    journalOperationsRef.current = operations;
    await persistJournalOperations(operations);
    await setAndPersistJournals(mergeJournalOperations(journalRecordsRef.current, operations));
    setPendingJournalDeletion({ record, expiresAt });
  }, [cacheOwner, persistJournalOperations, setAndPersistJournals]);

  const undoJournalDelete = useCallback(async () => {
    const pending = pendingJournalDeletion;
    if (!pending) return;
    const operations = restoreJournalOperationsAfterUndo(journalOperationsRef.current, pending.record);
    journalOperationsRef.current = operations;
    await persistJournalOperations(operations);
    await setAndPersistJournals(mergeJournalOperations(
      [pending.record, ...journalRecordsRef.current.filter((item) => item.date !== pending.record.date)],
      operations
    ));
    setPendingJournalDeletion(null);
  }, [cacheOwner, pendingJournalDeletion, persistJournalOperations, setAndPersistJournals]);

  useEffect(() => {
    if (!pendingJournalDeletion) return;
    const delay = Math.max(0, Date.parse(pendingJournalDeletion.expiresAt) - Date.now());
    const timer = setTimeout(() => {
      setPendingJournalDeletion(null);
      if (session) {
        void runJournalSync({ automatic: true }).catch(() => undefined);
      } else {
        void (async () => {
          const now = Date.now();
          const expired = journalOperationsRef.current.filter((item) =>
            item.kind === "delete" && (!item.notBefore || Date.parse(item.notBefore) <= now)
          );
          await Promise.all(expired.map((item) => removePendingJournal(item.date)));
          const expiredIds = new Set(expired.map((item) => item.id));
          const operations = journalOperationsRef.current.filter((item) => !expiredIds.has(item.id));
          journalOperationsRef.current = operations;
          await persistJournalOperations(operations);
        })();
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [cacheOwner, pendingJournalDeletion, persistJournalOperations, runJournalSync, session]);

  useEffect(() => {
    if (!session || isLoading) return;
    const retry = () => void runJournalSync({ automatic: true }).catch(() => undefined);
    const unsubscribeNetwork = NetInfo.addEventListener((state) => {
      if (state.isConnected) retry();
    });
    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") retry();
    });
    retry();
    return () => {
      unsubscribeNetwork();
      appStateSubscription.remove();
    };
  }, [isLoading, runJournalSync, session]);

  useEffect(() => {
    if (session || isLoading) return;
    const now = Date.now();
    const expired = journalOperationsRef.current.filter((item) =>
      item.kind === "delete" && (!item.notBefore || Date.parse(item.notBefore) <= now)
    );
    if (expired.length === 0) return;
    void (async () => {
      await Promise.all(expired.map((item) => removePendingJournal(item.date)));
      const expiredIds = new Set(expired.map((item) => item.id));
      const operations = journalOperationsRef.current.filter((item) => !expiredIds.has(item.id));
      journalOperationsRef.current = operations;
      await persistJournalOperations(operations);
    })();
  }, [isLoading, persistJournalOperations, session]);

  const saveScreening = useCallback(async (answers: Record<string, string>, localResult: ScreeningResult) => {
    let result = localResult;
    if (session) {
      const serverResult = await api.submitScreening({ answers });
      result = {
        ...serverResult,
        id: `screening:${Date.now()}`,
        completedDate: new Date().toISOString().slice(0, 10)
      };
    } else {
      await enqueuePendingSync({ id: localResult.id, type: "screening", payload: { answers } });
    }

    const next = [result, ...screeningResults];
    setScreeningResults(next);
    await persist(journalRecords, next);
    return result;
  }, [journalRecords, persist, screeningResults, session]);

  const clearContent = useCallback(async () => {
    journalRecordsRef.current = [];
    journalOperationsRef.current = [];
    setJournalRecords([]);
    setScreeningResults([]);
    await Promise.all(contentCacheKeys(cacheOwner).map(removeDeviceCache));
  }, [cacheOwner]);

  const value = useMemo(() => ({
    isGuest,
    isLoading,
    journalOwner: cacheOwner,
    pendingJournalDeletion,
    route: stack[stack.length - 1],
    stack,
    backTransitionKey,
    journalRecords,
    screeningResults,
    navigate,
    goBack,
    resetTo,
    saveJournal,
    retryJournal,
    deleteJournal,
    undoJournalDelete,
    saveScreening,
    clearContent
  }), [backTransitionKey, cacheOwner, clearContent, deleteJournal, goBack, isGuest, isLoading, journalRecords, navigate, pendingJournalDeletion, resetTo, retryJournal, saveJournal, saveScreening, screeningResults, stack, undoJournalDelete]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  const scopedRoute = useContext(AppRouteContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return scopedRoute ? { ...context, route: scopedRoute } : context;
}

export function AppRouteScope({ route, children }: { route: AppRoute; children: React.ReactNode }) {
  return <AppRouteContext.Provider value={route}>{children}</AppRouteContext.Provider>;
}

function generateComfort(selected: string[]) {
  if (selected.some((emotion) => ["불안", "두려움"].includes(emotion))) {
    return "불안한 마음을 솔직하게 마주했어요. 깊게 숨 한번 쉬고, 오늘 하루도 잘 견뎌낸 나를 다독여주세요.";
  }
  if (selected.some((emotion) => ["슬픔", "외로움", "무기력", "지침"].includes(emotion))) {
    return "오늘 많이 지쳤군요. 여기에 마음을 남겨줘서 고마워요. 오늘 하루 버텨낸 것만으로도 충분해요.";
  }
  return "오늘의 감정을 솔직하게 기록해줘서 고마워요. 지금의 마음을 알아차린 시간이 오래 따뜻하게 남기를 바라요.";
}

function normalizeJournalRecord(record: JournalRecord, fallbackStatus: JournalRecord["syncStatus"]): JournalRecord {
  return {
    ...record,
    version: typeof record.version === "number" ? record.version : -1,
    syncStatus: record.syncStatus ?? fallbackStatus
  };
}
