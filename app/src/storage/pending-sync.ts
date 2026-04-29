import { loadDeviceCache, removeDeviceCache } from "./device-cache";

export const PENDING_SYNC_KEY = "sync.queue";

export type PendingSyncItem =
  | {
      id: string;
      type: "journal";
      payload: {
        date: string;
        emotions: string[];
        body: string;
      };
    }
  | {
      id: string;
      type: "screening";
      payload: {
        answers: Record<string, string>;
      };
    };

export async function loadPendingSyncQueue() {
  return (await loadDeviceCache<PendingSyncItem[]>(PENDING_SYNC_KEY)) ?? [];
}

export async function clearPendingSyncQueue() {
  await removeDeviceCache(PENDING_SYNC_KEY);
}
