import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  operations: [] as Array<Record<string, unknown>>,
  saveCalls: 0,
  saveError: null as Error | null
}));

vi.mock("../storage/journal-operations", () => ({
  loadJournalOperations: vi.fn(async () => state.operations),
  saveJournalOperations: vi.fn(async (_owner: string, operations: Array<Record<string, unknown>>) => {
    state.operations = operations;
  })
}));

vi.mock("../storage/journal-drafts", () => ({
  removeJournalDraft: vi.fn(async () => undefined)
}));

vi.mock("./api", () => {
  class ApiError extends Error {
    constructor(public readonly status: number) {
      super(`Request failed: ${status}`);
    }
  }
  return {
    ApiError,
    isRetryableApiError: (error: unknown) => !(error instanceof ApiError) || error.status >= 500,
    api: {
      saveJournalEntry: vi.fn(async (payload: { date: string; emotions: string[]; body: string }) => {
        state.saveCalls += 1;
        if (state.saveError) throw state.saveError;
        return {
          ...payload,
          emotions: payload.emotions.map((label: string) => ({ id: label, label })),
          comfortMessage: "서버 위로",
          createdAt: "2026-09-03T00:00:00Z",
          version: 3
        };
      }),
      deleteJournalEntry: vi.fn(async () => ({ deleted: true }))
    },
    toJournalRecord: (entry: Record<string, any>) => ({
      id: `journal:${entry.date}`,
      ...entry,
      emotions: entry.emotions.map((emotion: { label: string }) => emotion.label),
      syncStatus: "synced"
    })
  };
});

import { processJournalOperations } from "./journal-sync";

function saveOperation(overrides: Record<string, unknown> = {}) {
  return {
    id: "save:2026-09-03",
    kind: "save",
    date: "2026-09-03",
    record: {
      id: "journal:2026-09-03",
      date: "2026-09-03",
      emotions: ["평온"],
      body: "기록",
      comfortMessage: "로컬 위로",
      createdAt: "2026-09-03T00:00:00Z",
      version: 2,
      syncStatus: "pending"
    },
    expectedVersion: 2,
    status: "pending",
    retryable: true,
    attempts: 0,
    ...overrides
  };
}

describe("journal sync processor", () => {
  beforeEach(() => {
    state.operations = [];
    state.saveCalls = 0;
    state.saveError = null;
  });

  it("automatically processes retryable work but skips attention and undo-window work", async () => {
    state.operations = [
      saveOperation(),
      saveOperation({ id: "conflict", date: "2026-09-02", status: "conflict", retryable: false }),
      saveOperation({ id: "future", date: "2026-09-01", kind: "delete", notBefore: "2999-01-01T00:00:00Z" })
    ];

    const result = await processJournalOperations("owner", { automatic: true });

    expect(state.saveCalls).toBe(1);
    expect(result.savedRecords[0]).toMatchObject({ version: 3, syncStatus: "synced" });
    expect(result.operations.map((operation) => operation.id)).toEqual(["conflict", "future"]);
  });

  it("keeps network failures retryable with a visible failed state", async () => {
    state.operations = [saveOperation()];
    state.saveError = new TypeError("Network request failed");

    const result = await processJournalOperations("owner", { automatic: false });

    expect(result.operations[0]).toMatchObject({ status: "failed", retryable: true, attempts: 1 });
  });
});
