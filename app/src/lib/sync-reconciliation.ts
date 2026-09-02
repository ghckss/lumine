import type { ContentImportResult } from "./api";
import type { PendingSyncItem } from "../storage/pending-sync";

export function reconcilePendingSync(
  queue: PendingSyncItem[],
  response: ContentImportResult
) {
  const resultById = new Map(response.items.map((item) => [item.id, item]));
  const remaining = queue.flatMap<PendingSyncItem>((item) => {
    const result = resultById.get(item.id);
    if (result?.status === "IMPORTED" || result?.status === "ALREADY_IMPORTED") return [];
    return [{
      ...item,
      status: result?.status === "CONFLICT" ? "conflict" : "failed",
      message: result?.message ?? "동기화 결과를 확인하지 못했습니다."
    }];
  });
  const syncedCount = response.items.filter((item) => item.status === "IMPORTED" || item.status === "ALREADY_IMPORTED").length;
  const conflictCount = remaining.filter((item) => item.status === "conflict").length;

  return {
    remaining,
    totalCount: queue.length,
    syncedCount,
    conflictCount,
    failedCount: remaining.length - conflictCount,
    remainingCount: remaining.length
  };
}
