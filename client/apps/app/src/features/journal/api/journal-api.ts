import type { JournalEntryPayload, ServerJournalEntry } from "@lumine/api-contracts";
import type { JournalRecord } from "../model/journal";
import { request } from "../../../shared/api/http-client";

export const journalApi = {
  saveJournalEntry(payload: JournalEntryPayload) {
    return request<ServerJournalEntry>("/api/journal/entries", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  deleteJournalEntry(date: string, expectedVersion: number) {
    const query = new URLSearchParams({ date, expectedVersion: String(expectedVersion) });
    return request<{ deleted: boolean }>(`/api/journal/entries?${query.toString()}`, { method: "DELETE" });
  },
  getJournalHistory(limit = 30) {
    return request<ServerJournalEntry[]>(`/api/journal/entries/history?limit=${limit}`);
  },
  getJournalRange(startDate: string, endDate: string) {
    const query = new URLSearchParams({ startDate, endDate });
    return request<ServerJournalEntry[]>(`/api/journal/entries/range?${query.toString()}`);
  }
};

export function toJournalRecord(entry: ServerJournalEntry): JournalRecord {
  return {
    id: `journal:${entry.date}`,
    date: entry.date,
    emotions: entry.emotions.map((emotion) => emotion.label),
    body: entry.body,
    comfortMessage: entry.comfortMessage,
    createdAt: entry.createdAt,
    version: entry.version,
    syncStatus: "synced"
  };
}
