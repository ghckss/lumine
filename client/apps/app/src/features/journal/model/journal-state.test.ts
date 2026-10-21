import { describe, expect, it } from "vitest";
import type { JournalRecord } from "./journal";
import { applyJournalSyncResult, expiredDeleteOperations, findUndoableDelete, normalizeJournalRecord } from "./journal-state";
import type { JournalOperation } from "../storage/journal-operations";

const record: JournalRecord = {
  id: "journal:2026-09-03",
  date: "2026-09-03",
  emotions: ["평온"],
  body: "기록",
  comfortMessage: "위로",
  createdAt: "2026-09-03T00:00:00Z",
  version: 2,
  syncStatus: "synced"
};

function deletion(date: string, notBefore?: string): JournalOperation {
  return {
    id: `delete:${date}`,
    kind: "delete",
    date,
    record: { ...record, id: `journal:${date}`, date },
    expectedVersion: 2,
    status: "pending",
    retryable: true,
    notBefore,
    attempts: 0
  };
}

describe("journal state helpers", () => {
  it("normalizes legacy records without replacing explicit values", () => {
    expect(normalizeJournalRecord({ ...record, version: undefined as never, syncStatus: undefined as never }, "local"))
      .toMatchObject({ version: -1, syncStatus: "local" });
    expect(normalizeJournalRecord(record, "local")).toMatchObject({ version: 2, syncStatus: "synced" });
  });

  it("applies deletions and same-date server saves before operation overlays", () => {
    const older = { ...record, id: "journal:2026-09-01", date: "2026-09-01" };
    const saved = { ...record, body: "서버 저장" };
    const pending = {
      id: "save:pending",
      kind: "save" as const,
      date: saved.date,
      record: { ...saved, body: "로컬 대기" },
      expectedVersion: 2,
      status: "pending" as const,
      retryable: true,
      attempts: 0
    };
    expect(applyJournalSyncResult([record, older], [pending], [saved], [older.date]))
      .toEqual([{ ...pending.record, syncStatus: "pending", syncMessage: undefined }]);
  });

  it("separates undoable and expired delete operations", () => {
    const now = Date.parse("2026-09-03T00:00:00Z");
    const expired = deletion("2026-09-01", "2026-09-02T00:00:00Z");
    const missingDeadline = deletion("2026-09-02");
    const future = deletion("2026-09-03", "2026-09-04T00:00:00Z");
    expect(findUndoableDelete([expired, future], now)?.id).toBe(future.id);
    expect(expiredDeleteOperations([expired, missingDeadline, future], now).map((item) => item.id))
      .toEqual([expired.id, missingDeadline.id]);
  });
});
