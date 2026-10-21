import type { JournalRecord } from "./journal";
import { mergeJournalOperations, type JournalOperation } from "../storage/journal-operations";

export function normalizeJournalRecord(
  record: JournalRecord,
  fallbackStatus: JournalRecord["syncStatus"]
): JournalRecord {
  return {
    ...record,
    version: typeof record.version === "number" ? record.version : -1,
    syncStatus: record.syncStatus ?? fallbackStatus
  };
}

export function applyJournalSyncResult(
  records: JournalRecord[],
  operations: JournalOperation[],
  savedRecords: JournalRecord[],
  deletedDates: string[]
) {
  let next = records.filter((record) => !deletedDates.includes(record.date));
  for (const saved of savedRecords) {
    next = [saved, ...next.filter((record) => record.date !== saved.date)];
  }
  return mergeJournalOperations(next, operations);
}

export function findUndoableDelete(operations: JournalOperation[], now = Date.now()) {
  return operations.find((operation) =>
    operation.kind === "delete" && Boolean(operation.notBefore) && Date.parse(operation.notBefore!) > now
  );
}

export function expiredDeleteOperations(operations: JournalOperation[], now = Date.now()) {
  return operations.filter((operation) =>
    operation.kind === "delete" && (!operation.notBefore || Date.parse(operation.notBefore) <= now)
  );
}
