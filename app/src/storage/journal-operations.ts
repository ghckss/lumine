import type { JournalRecord } from "../types/content";
import { loadDeviceCache, removeDeviceCache, saveDeviceCache } from "./device-cache";

export type JournalOperationStatus = "pending" | "failed" | "conflict";

export type JournalOperation = {
  id: string;
  kind: "save" | "delete";
  date: string;
  record: JournalRecord;
  expectedVersion: number;
  status: JournalOperationStatus;
  message?: string;
  notBefore?: string;
  attempts: number;
};

export function journalOperationsKey(owner: string) {
  return `journal.operations.${owner}`;
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

export function mergeJournalOperations(records: JournalRecord[], operations: JournalOperation[]) {
  const byDate = new Map<string, JournalRecord>(
    records.map((record) => [record.date, { ...record, syncStatus: "synced" }])
  );
  for (const operation of operations) {
    if (operation.kind === "delete") {
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
