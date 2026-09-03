import { describe, expect, it } from "vitest";
import type { JournalRecord } from "../types/content";
import { mergeJournalOperations, upsertJournalOperation, type JournalOperation } from "./journal-operations";

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

function operation(overrides: Partial<JournalOperation> = {}): JournalOperation {
  return {
    id: "save:1",
    kind: "save",
    date: record.date,
    record,
    expectedVersion: 2,
    status: "pending",
    attempts: 0,
    ...overrides
  };
}

describe("journal operations", () => {
  it("keeps only the latest operation for a date", () => {
    const next = upsertJournalOperation([operation()], operation({ id: "delete:1", kind: "delete" }));
    expect(next).toHaveLength(1);
    expect(next[0].kind).toBe("delete");
  });

  it("overlays pending saves and hides pending deletes", () => {
    const pendingRecord = { ...record, body: "오프라인 수정" };
    expect(mergeJournalOperations([record], [operation({ record: pendingRecord })])[0]).toMatchObject({
      body: "오프라인 수정",
      syncStatus: "pending"
    });
    expect(mergeJournalOperations([record], [operation({ kind: "delete" })])).toEqual([]);
  });

  it("preserves failed and conflict states", () => {
    expect(mergeJournalOperations([], [operation({ status: "conflict", message: "변경 충돌" })])[0]).toMatchObject({
      syncStatus: "conflict",
      syncMessage: "변경 충돌"
    });
  });
});
