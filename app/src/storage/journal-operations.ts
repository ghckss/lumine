import type { JournalRecord } from "../types/content";
import { journalOperationsCacheKey, loadDeviceCache, removeDeviceCache, saveDeviceCache } from "./device-cache";

export type JournalOperationStatus = "pending" | "failed" | "conflict";

export type JournalOperation = {
  id: string;
  kind: "save" | "delete";
  date: string;
  record: JournalRecord;
  expectedVersion: number;
  status: JournalOperationStatus;
  retryable: boolean;
  message?: string;
  notBefore?: string;
  attempts: number;
};

export function journalOperationsKey(owner: string) {
  return journalOperationsCacheKey(owner);
}

export async function loadJournalOperations(owner: string) {
  return (await loadDeviceCache<JournalOperation[]>(journalOperationsKey(owner))) ?? [];
}

export async function saveJournalOperations(owner: string, operations: JournalOperation[]) {
  if (operations.length === 0) {
    await removeDeviceCache(journalOperationsKey(owner));
  } else {
    await saveDeviceCache(journalOperationsKey(owner), operations);
  }
}

export function upsertJournalOperation(operations: JournalOperation[], operation: JournalOperation) {
  return [...operations.filter((item) => item.date !== operation.date), operation];
}

export function restoreJournalOperationsAfterUndo(operations: JournalOperation[], record: JournalRecord) {
  const next = operations.filter((item) => item.kind !== "delete" || item.date !== record.date);
  if (!["pending", "failed", "conflict"].includes(record.syncStatus)) return next;
  return upsertJournalOperation(next, {
    id: makeJournalOperationId("save", record.date),
    kind: "save",
    date: record.date,
    record,
    expectedVersion: record.version,
    status: record.syncStatus as JournalOperationStatus,
    retryable: record.syncStatus !== "conflict",
    message: record.syncMessage,
    attempts: 0
  });
}

export function mergeJournalOperations(records: JournalRecord[], operations: JournalOperation[]) {
  const byDate = new Map<string, JournalRecord>(
    records.map((record) => [record.date, { ...record, syncStatus: "synced" }])
  );
  for (const operation of operations) {
    if (operation.kind === "delete") {
      if (!operation.retryable && operation.status !== "pending") {
        byDate.set(operation.date, {
          ...operation.record,
          syncStatus: operation.status,
          syncMessage: operation.message
        });
        continue;
      }
      byDate.delete(operation.date);
      continue;
    }
    byDate.set(operation.date, {
      ...operation.record,
      syncStatus: operation.status,
      syncMessage: operation.message
    });
  }
  return [...byDate.values()].sort((left, right) => right.date.localeCompare(left.date));
}

export function makeJournalOperationId(kind: JournalOperation["kind"], date: string) {
  return `${kind}:${date}:${Date.now()}`;
}
