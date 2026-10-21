import { afterEach, describe, expect, it, vi } from "vitest";
import {
  commitIfActiveOwner,
  createDeleteUndoWindow,
  JournalSyncCoordinator,
  subscribeToJournalRetry
} from "./journal-orchestration";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

describe("journal production orchestration", () => {
  afterEach(() => { vi.useRealTimers(); });

  it("ignores stale owner hydration and server commits", () => {
    let activeOwner = "owner-a";
    const commits: string[] = [];
    activeOwner = "owner-b";

    expect(commitIfActiveOwner("owner-a", () => activeOwner, () => commits.push("hydration"))).toBe(false);
    expect(commitIfActiveOwner("owner-a", () => activeOwner, () => commits.push("server"))).toBe(false);
    expect(commits).toEqual([]);
  });

  it("finishes operation persistence before sync and serializes duplicate sync runs", async () => {
    const coordinator = new JournalSyncCoordinator<string>();
    const write = deferred<void>();
    const firstSync = deferred<string>();
    const order: string[] = [];

    const persistence = coordinator.persist(async () => {
      order.push("write:start");
      await write.promise;
      order.push("write:end");
    });
    const first = coordinator.run(async () => {
      order.push("sync:first:start");
      return firstSync.promise;
    });
    const second = coordinator.run(async () => {
      order.push("sync:second:start");
      return "second";
    });

    await Promise.resolve();
    expect(order).toEqual(["write:start"]);
    write.resolve();
    await persistence;
    await Promise.resolve();
    expect(order).toEqual(["write:start", "write:end", "sync:first:start"]);
    firstSync.resolve("first");
    await expect(first).resolves.toBe("first");
    await expect(second).resolves.toBe("second");
    expect(order).toEqual(["write:start", "write:end", "sync:first:start", "sync:second:start"]);
  });

  it("preserves a write failure for its caller while later persistence and sync recover", async () => {
    const coordinator = new JournalSyncCoordinator<string>();
    const firstWrite = deferred<void>();
    const snapshots: string[] = [];
    const first = coordinator.persist(async () => {
      await firstWrite.promise;
      throw new Error("disk unavailable");
    });
    const second = coordinator.persist(async () => {
      snapshots.push("latest");
    });

    firstWrite.resolve();
    await expect(first).rejects.toThrow("disk unavailable");
    await expect(second).resolves.toBeUndefined();
    expect(snapshots).toEqual(["latest"]);
    await expect(coordinator.run(async () => "synced")).resolves.toBe("synced");
    await expect(coordinator.persist(async () => { snapshots.push("after-sync"); })).resolves.toBeUndefined();
    expect(snapshots).toEqual(["latest", "after-sync"]);
  });

  it("settles delete expiry and undo mutually exclusively", () => {
    vi.useFakeTimers();
    const expired = vi.fn();
    const undone = createDeleteUndoWindow({ delay: 5_000, onExpire: expired });
    expect(undone.undo()).toBe(true);
    vi.advanceTimersByTime(5_000);
    expect(expired).not.toHaveBeenCalled();

    const elapsed = createDeleteUndoWindow({ delay: 5_000, onExpire: expired });
    vi.advanceTimersByTime(5_000);
    expect(expired).toHaveBeenCalledTimes(1);
    expect(elapsed.undo()).toBe(false);
  });

  it("retries on subscribe, reconnect, and active AppState, then cleans listeners", () => {
    let networkListener: ((connected: boolean) => void) | undefined;
    let appStateListener: ((state: string) => void) | undefined;
    const unsubscribeNetwork = vi.fn();
    const removeAppState = vi.fn();
    const retry = vi.fn();
    const cleanup = subscribeToJournalRetry({
      addNetworkListener(listener) { networkListener = listener; return unsubscribeNetwork; },
      addAppStateListener(listener) { appStateListener = listener; return { remove: removeAppState }; },
      retry
    });

    expect(retry).toHaveBeenCalledTimes(1);
    networkListener?.(false);
    networkListener?.(true);
    appStateListener?.("background");
    appStateListener?.("active");
    expect(retry).toHaveBeenCalledTimes(3);
    cleanup();
    expect(unsubscribeNetwork).toHaveBeenCalledOnce();
    expect(removeAppState).toHaveBeenCalledOnce();
  });
});
