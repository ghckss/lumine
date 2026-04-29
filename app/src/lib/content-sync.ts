import { api } from "./api";
import { clearPendingSyncQueue, loadPendingSyncQueue, type PendingSyncItem } from "../storage/pending-sync";

async function syncQueueItem(item: PendingSyncItem) {
  if (item.type === "journal") {
    await api.saveJournalEntry(item.payload);
    return;
  }

  if (item.type === "screening") {
    await api.submitScreening(item.payload);
  }
}

export async function syncGuestContentToServer() {
  const queue = await loadPendingSyncQueue();
  if (queue.length === 0) {
    return { syncedCount: 0 };
  }

  for (const item of queue) {
    await syncQueueItem(item);
  }

  await clearPendingSyncQueue();
  return { syncedCount: queue.length };
}
