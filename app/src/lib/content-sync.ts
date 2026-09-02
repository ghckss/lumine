import { api } from "./api";
import { loadPendingSyncQueue, savePendingSyncQueue } from "../storage/pending-sync";
import { reconcilePendingSync } from "./sync-reconciliation";

export async function syncGuestContentToServer() {
  const queue = await loadPendingSyncQueue();
  if (queue.length === 0) {
    return { totalCount: 0, syncedCount: 0, conflictCount: 0, failedCount: 0, remainingCount: 0 };
  }

  const response = await api.importGuestContent(queue.map((item) => {
    if (item.type === "journal") {
      return { id: item.id, type: "JOURNAL" as const, journal: item.payload };
    }
    return { id: item.id, type: "SCREENING" as const, screening: item.payload };
  }));

  const result = reconcilePendingSync(queue, response);
  await savePendingSyncQueue(result.remaining);
  return result;
}
