import { loadDeviceCache, removeDeviceCache, saveDeviceCache } from "./device-cache";

export const PENDING_SYNC_KEY = "sync.queue";

export type PendingSyncStatus = "pending" | "conflict" | "failed";

type PendingSyncMetadata = {
  status?: PendingSyncStatus;
  message?: string;
};

export type PendingSyncItem =
  | (PendingSyncMetadata & {
      id: string;
      type: "journal";
      payload: {
        date: string;
        emotions: string[];
        body: string;
      };
    })
  | (PendingSyncMetadata & {
      id: string;
      type: "screening";
      payload: {
        answers: Record<string, string>;
      };
    });

export async function loadPendingSyncQueue() {
  return (await loadDeviceCache<PendingSyncItem[]>(PENDING_SYNC_KEY)) ?? [];
}

export async function clearPendingSyncQueue() {
  await removeDeviceCache(PENDING_SYNC_KEY);
}

export async function savePendingSyncQueue(queue: PendingSyncItem[]) {
  if (queue.length === 0) {
    await clearPendingSyncQueue();
    return;
  }
  await saveDeviceCache(PENDING_SYNC_KEY, queue);
}

export async function enqueuePendingSync(item: PendingSyncItem) {
  const queue = await loadPendingSyncQueue();
  const withoutDuplicate = queue.filter((queued) => queued.id !== item.id);
  await savePendingSyncQueue([...withoutDuplicate, { ...item, status: "pending", message: undefined }]);
}

export async function removePendingJournal(date: string) {
  const queue = await loadPendingSyncQueue();
  await savePendingSyncQueue(queue.filter((item) => item.type !== "journal" || item.payload.date !== date));
}
