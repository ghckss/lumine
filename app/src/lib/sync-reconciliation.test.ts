import { describe, expect, it } from "vitest";
import { reconcilePendingSync } from "./sync-reconciliation";
import type { PendingSyncItem } from "../storage/pending-sync";

describe("reconcilePendingSync", () => {
  it("removes imported items and preserves conflict and failed items", () => {
    const queue: PendingSyncItem[] = [
      { id: "journal:1", type: "journal", payload: { date: "2026-09-01", emotions: ["평온"], body: "기록" } },
      { id: "screening:1", type: "screening", payload: { answers: { q1: "0" } } },
      { id: "journal:2", type: "journal", payload: { date: "2026-09-02", emotions: ["불안"], body: "충돌" } },
      { id: "missing", type: "screening", payload: { answers: { q1: "1" } } }
    ];

    const result = reconcilePendingSync(queue, {
      items: [
        { id: "journal:1", status: "IMPORTED" },
        { id: "screening:1", status: "ALREADY_IMPORTED" },
        { id: "journal:2", status: "CONFLICT", message: "같은 날짜 기록" }
      ]
    });

    expect(result).toMatchObject({ totalCount: 4, syncedCount: 2, conflictCount: 1, failedCount: 1, remainingCount: 2 });
    expect(result.remaining).toEqual([
      expect.objectContaining({ id: "journal:2", status: "conflict", message: "같은 날짜 기록" }),
      expect.objectContaining({ id: "missing", status: "failed" })
    ]);
  });
});
