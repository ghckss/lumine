import { ApiError, api, isRetryableApiError, toJournalRecord } from "./api";
import { removeJournalDraft } from "../storage/journal-drafts";
import {
  loadJournalOperations,
  saveJournalOperations,
  type JournalOperation
} from "../storage/journal-operations";
import type { JournalRecord } from "../types/content";

export type JournalSyncResult = {
  operations: JournalOperation[];
  savedRecords: JournalRecord[];
  deletedDates: string[];
};

export async function processJournalOperations(
  owner: string,
  options: { automatic: boolean; date?: string } = { automatic: true }
): Promise<JournalSyncResult> {
  let operations = await loadJournalOperations(owner);
  const savedRecords: JournalRecord[] = [];
  const deletedDates: string[] = [];

  for (const operation of [...operations]) {
    if (options.date && operation.date !== options.date) continue;
    if (operation.notBefore && Date.parse(operation.notBefore) > Date.now()) continue;
    if (options.automatic && !operation.retryable) continue;

    try {
      if (operation.kind === "save") {
        const saved = toJournalRecord(await api.saveJournalEntry({
          date: operation.date,
          emotions: operation.record.emotions,
          body: operation.record.body,
          expectedVersion: operation.expectedVersion
        }));
        savedRecords.push(saved);
      } else {
        await api.deleteJournalEntry(operation.date, operation.expectedVersion);
        deletedDates.push(operation.date);
      }
      operations = operations.filter((item) => item.id !== operation.id);
      if (operation.kind === "save") {
        await removeJournalDraft(owner, operation.date).catch(() => undefined);
      }
    } catch (error) {
      const conflict = error instanceof ApiError && error.status === 409;
      const retryable = isRetryableApiError(error);
      operations = operations.map((item) => item.id === operation.id ? {
        ...item,
        status: conflict ? "conflict" : "failed",
        retryable,
        attempts: item.attempts + 1,
        message: conflict
          ? "다른 기기에서 변경된 기록이에요. 내용을 확인해 주세요."
          : retryable
            ? "연결이 불안정해 아직 서버에 저장하지 못했어요."
            : "저장 요청을 확인해 주세요."
      } : item);
    }
    await saveJournalOperations(owner, operations);
  }

  return { operations, savedRecords, deletedDates };
}
