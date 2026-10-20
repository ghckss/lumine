import type { ScreeningResult, UserProfile } from "@lumine/domain";

export type JournalEntryPayload = {
  date: string;
  emotions: string[];
  body: string;
  expectedVersion?: number;
};

export type ServerJournalEntry = {
  date: string;
  emotions: Array<{ id: string; label: string }>;
  body: string;
  comfortMessage: string;
  createdAt: string;
  version: number;
};

export type ScreeningPayload = { answers: Record<string, string> };

export type ScreeningHistoryItem = {
  completedDate: string;
  publicSummary: string;
  recommendedRescreenAt: string;
  requiresSafetyPrompt: boolean;
  comparisonScore?: number;
};

export type ContentImportItem =
  | { id: string; type: "JOURNAL"; journal: JournalEntryPayload }
  | { id: string; type: "SCREENING"; screening: ScreeningPayload };

export type ContentImportResult = {
  items: Array<{
    id: string;
    status: "IMPORTED" | "ALREADY_IMPORTED" | "CONFLICT" | "FAILED";
    message?: string | null;
  }>;
};

export type UserDataExport = {
  schemaVersion: string;
  exportedAt: string;
  profile: UserProfile;
  journals: ServerJournalEntry[];
  screenings: Array<
    ScreeningResult & { completedDate: string; answers: Record<string, string> }
  >;
};

export type SupportResource = {
  code: string;
  title: string;
  phone: string;
  description: string;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly responseBody?: string,
  ) {
    super(`Request failed: ${status}`);
    this.name = "ApiError";
  }
}

export function isRetryableApiError(error: unknown) {
  return !(error instanceof ApiError) || error.status >= 500;
}

export type PendingSyncItemLike = {
  id: string;
  status?: "pending" | "conflict" | "failed";
  message?: string;
};

export function reconcilePendingSync<T extends PendingSyncItemLike>(
  queue: readonly T[],
  response: ContentImportResult,
) {
  const resultById = new Map(response.items.map((item) => [item.id, item]));
  const remaining = queue.flatMap<T>((item) => {
    const result = resultById.get(item.id);
    if (result?.status === "IMPORTED" || result?.status === "ALREADY_IMPORTED")
      return [];
    return [
      {
        ...item,
        status: result?.status === "CONFLICT" ? "conflict" : "failed",
        message: result?.message ?? "동기화 결과를 확인하지 못했습니다.",
      },
    ];
  });
  const syncedCount = response.items.filter(
    (item) => item.status === "IMPORTED" || item.status === "ALREADY_IMPORTED",
  ).length;
  const conflictCount = remaining.filter(
    (item) => item.status === "conflict",
  ).length;
  return {
    remaining,
    totalCount: queue.length,
    syncedCount,
    conflictCount,
    failedCount: remaining.length - conflictCount,
    remainingCount: remaining.length,
  };
}

export function serializeUserDataExport(data: UserDataExport) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

export function createUserDataExportFileName(now = new Date()) {
  const timestamp = now.toISOString().replace(/[:.]/g, "-");
  return `lumine-data-${timestamp}.json`;
}
