export class JournalSyncCoordinator<T> {
  private queueWriteInFlight: Promise<void> | null = null;
  private syncInFlight: Promise<T> | null = null;

  async persist(write: () => Promise<void>) {
    const previousWrite = this.queueWriteInFlight;
    const currentWrite = (async () => {
      if (previousWrite) await previousWrite.catch(() => undefined);
      await write();
    })();
    this.queueWriteInFlight = currentWrite;
    try {
      await currentWrite;
    } finally {
      if (this.queueWriteInFlight === currentWrite) this.queueWriteInFlight = null;
    }
  }

  async waitForSync() {
    if (this.syncInFlight) await this.syncInFlight;
  }

  run(start: () => Promise<T>) {
    const previousSync = this.syncInFlight;
    const currentSync = (async () => {
      if (previousSync) await previousSync.catch(() => undefined);
      while (this.queueWriteInFlight) await this.queueWriteInFlight;
      return start();
    })();
    this.syncInFlight = currentSync;
    void currentSync.finally(() => {
      if (this.syncInFlight === currentSync) this.syncInFlight = null;
    }).catch(() => undefined);
    return currentSync;
  }
}

export function commitIfActiveOwner(owner: string, activeOwner: () => string, commit: () => void) {
  if (activeOwner() !== owner) return false;
  commit();
  return true;
}

export function createDeleteUndoWindow({ delay, onExpire }: { delay: number; onExpire: () => void }) {
  let settled = false;
  const timer = setTimeout(() => {
    if (settled) return;
    settled = true;
    onExpire();
  }, delay);

  return {
    undo() {
      if (settled) return false;
      settled = true;
      clearTimeout(timer);
      return true;
    },
    dispose() {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
    }
  };
}

export type JournalLifecycleDependencies = {
  addNetworkListener: (listener: (connected: boolean) => void) => () => void;
  addAppStateListener: (listener: (state: string) => void) => { remove: () => void };
  retry: () => void;
};

export function subscribeToJournalRetry({ addNetworkListener, addAppStateListener, retry }: JournalLifecycleDependencies) {
  const unsubscribeNetwork = addNetworkListener((connected) => { if (connected) retry(); });
  const appStateSubscription = addAppStateListener((state) => { if (state === "active") retry(); });
  retry();
  return () => {
    unsubscribeNetwork();
    appStateSubscription.remove();
  };
}
