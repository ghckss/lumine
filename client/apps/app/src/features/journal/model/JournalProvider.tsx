import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { createComfortMessage, localIsoDate, monthRange, replaceJournalRange } from "@lumine/domain";
import { useSession } from "../../auth";
import { loadDeviceCache, removeDeviceCache, saveDeviceCache } from "../../../shared/storage/device-cache";
import { enqueuePendingSync, removePendingJournal } from "../../../shared/storage/pending-sync";
import { journalApi, toJournalRecord } from "../api/journal-api";
import { processJournalOperations, type JournalSyncResult } from "../services/journal-sync";
import { removeJournalDraft } from "../storage/journal-drafts";
import {
  journalContentCacheKeys,
  journalRecordsCacheKey,
  LEGACY_JOURNAL_RECORDS_CACHE_KEY
} from "../storage/journal-cache";
import {
  loadJournalOperations,
  makeJournalOperationId,
  mergeJournalOperations,
  restoreJournalOperationsAfterUndo,
  saveJournalOperations,
  upsertJournalOperation,
  type JournalOperation
} from "../storage/journal-operations";
import type { JournalRecord } from "./journal";
import {
  commitIfActiveOwner,
  createDeleteUndoWindow,
  JournalSyncCoordinator,
  subscribeToJournalRetry
} from "./journal-orchestration";
import { applyJournalSyncResult, expiredDeleteOperations, findUndoableDelete, normalizeJournalRecord } from "./journal-state";

export type RecordsViewState = { selectedMonth: string; selectedDate: string | null };
export type PendingJournalDeletion = { record: JournalRecord; expiresAt: string };

export type JournalContextValue = {
  isJournalLoading: boolean;
  journalRecords: JournalRecord[];
  journalOwner: string;
  pendingJournalDeletion: PendingJournalDeletion | null;
  recordsViewState: RecordsViewState;
  updateRecordsViewState: (next: Partial<RecordsViewState>) => void;
  saveJournal: (input: { date: string; emotions: string[]; body: string }) => Promise<JournalRecord>;
  loadJournalRange: (startDate: string, endDate: string) => Promise<void>;
  retryJournal: (date: string) => Promise<void>;
  deleteJournal: (record: JournalRecord) => Promise<void>;
  undoJournalDelete: () => Promise<void>;
  clearJournalContent: () => Promise<void>;
};

const JournalContext = createContext<JournalContextValue | null>(null);

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const { session, contentRevision } = useSession();
  const owner = session?.userId ?? "guest";
  const activeOwnerRef = useRef(owner);
  activeOwnerRef.current = owner;
  const recordsCacheKey = journalRecordsCacheKey(owner);
  const [journalRecords, setJournalRecords] = useState<JournalRecord[]>([]);
  const recordsRef = useRef<JournalRecord[]>([]);
  const operationsRef = useRef<JournalOperation[]>([]);
  const syncCoordinatorRef = useRef(new JournalSyncCoordinator<JournalSyncResult>());
  const undoWindowRef = useRef<ReturnType<typeof createDeleteUndoWindow> | null>(null);
  const [pendingJournalDeletion, setPendingJournalDeletion] = useState<PendingJournalDeletion | null>(null);
  const [recordsViewState, setRecordsViewState] = useState<RecordsViewState>(() => initialRecordsViewState());
  const [isJournalLoading, setIsJournalLoading] = useState(true);

  const updateRecordsViewState = useCallback((next: Partial<RecordsViewState>) => {
    setRecordsViewState((current) => ({ ...current, ...next }));
  }, []);

  useEffect(() => { setRecordsViewState(initialRecordsViewState()); }, [owner]);

  const setAndPersistRecords = useCallback(async (records: JournalRecord[]) => {
    recordsRef.current = records;
    setJournalRecords(records);
    await saveDeviceCache(recordsCacheKey, records);
  }, [recordsCacheKey]);

  const persistOperations = useCallback(async (operations: JournalOperation[]) => {
    await syncCoordinatorRef.current.persist(() => saveJournalOperations(owner, operations));
  }, [owner]);

  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      setIsJournalLoading(true);
      recordsRef.current = [];
      operationsRef.current = [];
      setJournalRecords([]);
      setPendingJournalDeletion(null);

      let [cachedRecords, operations] = await Promise.all([
        loadDeviceCache<JournalRecord[]>(recordsCacheKey),
        loadJournalOperations(owner)
      ]);
      if (!session && !cachedRecords) {
        cachedRecords = await loadDeviceCache<JournalRecord[]>(LEGACY_JOURNAL_RECORDS_CACHE_KEY);
        await Promise.all([
          saveDeviceCache(recordsCacheKey, cachedRecords ?? []),
          removeDeviceCache(LEGACY_JOURNAL_RECORDS_CACHE_KEY)
        ]);
      }

      if (mounted) commitIfActiveOwner(owner, () => activeOwnerRef.current, () => {
        const normalized = (cachedRecords ?? []).map((record) =>
          normalizeJournalRecord(record, session ? "synced" : "local")
        );
        operationsRef.current = operations;
        recordsRef.current = mergeJournalOperations(normalized, operations);
        setJournalRecords(recordsRef.current);
        const undoableDelete = findUndoableDelete(operations);
        setPendingJournalDeletion(undoableDelete
          ? { record: undoableDelete.record, expiresAt: undoableDelete.notBefore! }
          : null);
      });

      if (session) {
        const serverRecords = await journalApi.getJournalHistory(70).catch(() => null);
        if (mounted && serverRecords) {
          let mapped: JournalRecord[] | null = null;
          commitIfActiveOwner(owner, () => activeOwnerRef.current, () => {
            mapped = mergeJournalOperations(serverRecords.map(toJournalRecord), operations);
            recordsRef.current = mapped;
            setJournalRecords(mapped);
          });
          if (mapped) await saveDeviceCache(recordsCacheKey, mapped);
        }
      }
    }

    void hydrate().catch(() => undefined).finally(() => {
      if (mounted && activeOwnerRef.current === owner) setIsJournalLoading(false);
    });
    return () => { mounted = false; };
  }, [contentRevision, owner, recordsCacheKey, session]);

  const runJournalSync = useCallback(async (options: { automatic: boolean; date?: string }) => {
    if (!session) return null;
    const syncOwner = owner;
    const result = await syncCoordinatorRef.current.run(() => processJournalOperations(syncOwner, options));
    if (!commitIfActiveOwner(syncOwner, () => activeOwnerRef.current, () => {
      operationsRef.current = result.operations;
    })) return result;
    await setAndPersistRecords(applyJournalSyncResult(
      recordsRef.current,
      result.operations,
      result.savedRecords,
      result.deletedDates
    ));
    return result;
  }, [owner, session, setAndPersistRecords]);

  const saveJournal = useCallback(async (input: { date: string; emotions: string[]; body: string }) => {
    let record: JournalRecord;
    if (session) {
      await syncCoordinatorRef.current.waitForSync();
      const existing = recordsRef.current.find((item) => item.date === input.date);
      record = {
        id: `journal:${input.date}`,
        ...input,
        comfortMessage: existing?.comfortMessage ?? createComfortMessage(input.emotions),
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
      const operations = upsertJournalOperation(operationsRef.current, operation);
      operationsRef.current = operations;
      await persistOperations(operations);
      await setAndPersistRecords(mergeJournalOperations(recordsRef.current, operations));
      const result = await runJournalSync({ automatic: false, date: input.date });
      const remaining = result?.operations.find((item) => item.date === input.date);
      if (remaining) throw new Error(remaining.message ?? "기록을 아직 서버에 저장하지 못했어요.");
      record = recordsRef.current.find((item) => item.date === input.date) ?? record;
    } else {
      record = {
        id: `journal:${input.date}`,
        ...input,
        comfortMessage: createComfortMessage(input.emotions),
        createdAt: new Date().toISOString(),
        version: -1,
        syncStatus: "local"
      };
      await enqueuePendingSync({ id: record.id, type: "journal", payload: input });
      await removeJournalDraft(owner, input.date);
      await setAndPersistRecords([record, ...recordsRef.current.filter((item) => item.date !== record.date)]);
    }
    return record;
  }, [owner, persistOperations, runJournalSync, session, setAndPersistRecords]);

  const loadJournalRange = useCallback(async (startDate: string, endDate: string) => {
    if (!session) return;
    const requestOwner = owner;
    const serverRecords = (await journalApi.getJournalRange(startDate, endDate)).map(toJournalRecord);
    if (activeOwnerRef.current !== requestOwner) return;
    await setAndPersistRecords(mergeJournalOperations(
      replaceJournalRange(recordsRef.current, serverRecords, { start: startDate, end: endDate }),
      operationsRef.current
    ));
  }, [owner, session, setAndPersistRecords]);

  const retryJournal = useCallback(async (date: string) => {
    const result = await runJournalSync({ automatic: false, date });
    const remaining = result?.operations.find((item) => item.date === date);
    if (remaining) throw new Error(remaining.message ?? "다시 저장하지 못했어요.");
  }, [runJournalSync]);

  const deleteJournal = useCallback(async (record: JournalRecord) => {
    await syncCoordinatorRef.current.waitForSync();
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
    const operations = upsertJournalOperation(operationsRef.current, operation);
    operationsRef.current = operations;
    await persistOperations(operations);
    await setAndPersistRecords(mergeJournalOperations(recordsRef.current, operations));
    setPendingJournalDeletion({ record, expiresAt });
  }, [persistOperations, setAndPersistRecords]);

  const undoJournalDelete = useCallback(async () => {
    const pending = pendingJournalDeletion;
    if (!pending) return;
    if (undoWindowRef.current && !undoWindowRef.current.undo()) return;
    const operations = restoreJournalOperationsAfterUndo(operationsRef.current, pending.record);
    operationsRef.current = operations;
    await persistOperations(operations);
    await setAndPersistRecords(mergeJournalOperations(
      [pending.record, ...recordsRef.current.filter((item) => item.date !== pending.record.date)],
      operations
    ));
    setPendingJournalDeletion(null);
  }, [pendingJournalDeletion, persistOperations, setAndPersistRecords]);

  const expireGuestDeletes = useCallback(async () => {
    const expired = expiredDeleteOperations(operationsRef.current);
    await Promise.all(expired.map((item) => removePendingJournal(item.date)));
    const expiredIds = new Set(expired.map((item) => item.id));
    const operations = operationsRef.current.filter((item) => !expiredIds.has(item.id));
    operationsRef.current = operations;
    await persistOperations(operations);
  }, [persistOperations]);

  useEffect(() => {
    if (!pendingJournalDeletion) return;
    const delay = Math.max(0, Date.parse(pendingJournalDeletion.expiresAt) - Date.now());
    const undoWindow = createDeleteUndoWindow({ delay, onExpire: () => {
      setPendingJournalDeletion(null);
      if (session) {
        void runJournalSync({ automatic: true }).catch(() => undefined);
      } else {
        void expireGuestDeletes();
      }
    } });
    undoWindowRef.current = undoWindow;
    return () => {
      undoWindow.dispose();
      if (undoWindowRef.current === undoWindow) undoWindowRef.current = null;
    };
  }, [expireGuestDeletes, pendingJournalDeletion, runJournalSync, session]);

  useEffect(() => {
    if (!session || isJournalLoading) return;
    const retry = () => void runJournalSync({ automatic: true }).catch(() => undefined);
    return subscribeToJournalRetry({
      addNetworkListener: (listener) => NetInfo.addEventListener((state) => listener(Boolean(state.isConnected))),
      addAppStateListener: (listener) => AppState.addEventListener("change", listener),
      retry
    });
  }, [isJournalLoading, runJournalSync, session]);

  useEffect(() => {
    if (session || isJournalLoading || expiredDeleteOperations(operationsRef.current).length === 0) return;
    void expireGuestDeletes();
  }, [expireGuestDeletes, isJournalLoading, session]);

  const clearJournalContent = useCallback(async () => {
    undoWindowRef.current?.dispose();
    undoWindowRef.current = null;
    recordsRef.current = [];
    operationsRef.current = [];
    setJournalRecords([]);
    setPendingJournalDeletion(null);
    await Promise.all(journalContentCacheKeys(owner).map(removeDeviceCache));
  }, [owner]);

  const value = useMemo<JournalContextValue>(() => ({
    isJournalLoading,
    journalRecords,
    journalOwner: owner,
    pendingJournalDeletion,
    recordsViewState,
    updateRecordsViewState,
    saveJournal,
    loadJournalRange,
    retryJournal,
    deleteJournal,
    undoJournalDelete,
    clearJournalContent
  }), [clearJournalContent, deleteJournal, isJournalLoading, journalRecords, loadJournalRange, owner, pendingJournalDeletion, recordsViewState, retryJournal, saveJournal, undoJournalDelete, updateRecordsViewState]);

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (!context) throw new Error("useJournal must be used within JournalProvider");
  return context;
}

function initialRecordsViewState(): RecordsViewState {
  const today = localIsoDate();
  return { selectedMonth: monthRange(today).start, selectedDate: today };
}
