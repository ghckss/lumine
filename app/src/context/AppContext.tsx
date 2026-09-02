import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, toJournalRecord } from "../lib/api";
import { contentCacheKeys, loadDeviceCache, removeDeviceCache, saveDeviceCache } from "../storage/device-cache";
import { useSession } from "./SessionContext";
import { enqueuePendingSync } from "../storage/pending-sync";
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
  screeningResults: ScreeningResult[];
  navigate: (page: PageName, params?: Record<string, unknown>) => void;
  goBack: () => void;
  resetTo: (page: PageName, params?: Record<string, unknown>) => void;
  saveJournal: (input: { date: string; emotions: string[]; body: string }) => Promise<JournalRecord>;
  saveScreening: (answers: Record<string, string>, localResult: ScreeningResult) => Promise<ScreeningResult>;
  clearContent: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const AppRouteContext = createContext<AppRoute | null>(null);

export function AppProvider({ children, isGuest }: { children: React.ReactNode; isGuest: boolean }) {
  const { session, contentRevision } = useSession();
  const cacheOwner = session?.userId ?? "guest";
  const [journalCacheKey, screeningCacheKey] = contentCacheKeys(cacheOwner);
  const routeSequence = useRef(0);
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [stack, setStack] = useState<AppRoute[]>([{ key: "route:0", page: "home" }]);
  const [backTransitionKey, setBackTransitionKey] = useState<string | null>(null);
  const [journalRecords, setJournalRecords] = useState<JournalRecord[]>([]);
  const [screeningResults, setScreeningResults] = useState<ScreeningResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const persist = useCallback(async (journals: JournalRecord[], screenings: ScreeningResult[]) => {
    await Promise.all([
      saveDeviceCache(journalCacheKey, journals),
      saveDeviceCache(screeningCacheKey, screenings)
    ]);
  }, [journalCacheKey, screeningCacheKey]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      let [cachedJournals, cachedScreenings] = await Promise.all([
        loadDeviceCache<JournalRecord[]>(journalCacheKey),
        loadDeviceCache<ScreeningResult[]>(screeningCacheKey)
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
        setJournalRecords(cachedJournals ?? []);
        setScreeningResults(cachedScreenings ?? []);
      }

      if (session) {
        const [serverJournals, serverScreenings] = await Promise.all([
          api.getJournalHistory(30).catch(() => null),
          api.getScreeningHistory().catch(() => null)
        ]);

        if (mounted && serverJournals) {
          const mapped = serverJournals.map(toJournalRecord);
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
            requiresSafetyPrompt: result.requiresSafetyPrompt
          }));
          setScreeningResults(mapped);
          await saveDeviceCache(screeningCacheKey, mapped);
        }
      }

      if (mounted) setIsLoading(false);
    }

    void load();
    return () => { mounted = false; };
  }, [contentRevision, journalCacheKey, screeningCacheKey, session]);

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

  const saveJournal = useCallback(async (input: { date: string; emotions: string[]; body: string }) => {
    let record: JournalRecord;
    if (session) {
      record = toJournalRecord(await api.saveJournalEntry(input));
    } else {
      record = {
        id: `journal:${input.date}`,
        ...input,
        comfortMessage: generateComfort(input.emotions),
        createdAt: new Date().toISOString()
      };
      await enqueuePendingSync({ id: record.id, type: "journal", payload: input });
    }

    const next = [record, ...journalRecords.filter((item) => item.date !== record.date)];
    setJournalRecords(next);
    await persist(next, screeningResults);
    return record;
  }, [journalRecords, persist, screeningResults, session]);

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
    setJournalRecords([]);
    setScreeningResults([]);
    await Promise.all([removeDeviceCache(journalCacheKey), removeDeviceCache(screeningCacheKey)]);
  }, [journalCacheKey, screeningCacheKey]);

  const value = useMemo(() => ({
    isGuest,
    isLoading,
    route: stack[stack.length - 1],
    stack,
    backTransitionKey,
    journalRecords,
    screeningResults,
    navigate,
    goBack,
    resetTo,
    saveJournal,
    saveScreening,
    clearContent
  }), [backTransitionKey, clearContent, goBack, isGuest, isLoading, journalRecords, navigate, resetTo, saveJournal, saveScreening, screeningResults, stack]);

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
