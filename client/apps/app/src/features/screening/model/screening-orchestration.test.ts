import { describe, expect, it, vi } from "vitest";
import {
  createScreeningOwnerCoordinator,
  hydrateScreeningState,
  saveScreeningState,
  ScreeningOperationCoordinator
} from "./screening-orchestration";
import type { ScreeningResult } from "./screening";

function result(id: string): ScreeningResult {
  return {
    id,
    completedDate: "2026-10-01",
    publicSummary: id,
    publicComfortMessage: "comfort",
    recommendedActions: [],
    recommendedRescreenAt: "2026-10-29",
    requiresSafetyPrompt: false
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => { resolve = next; });
  return { promise, resolve };
}

function hydrationDependencies(overrides: Partial<Parameters<typeof hydrateScreeningState>[0]["dependencies"]> = {}) {
  return {
    loadOwnerCache: vi.fn(async () => null),
    loadLegacyCache: vi.fn(async () => null),
    migrateLegacyCache: vi.fn(async () => undefined),
    loadServerHistory: vi.fn(async () => null),
    persistOwnerCache: vi.fn(async () => undefined),
    ...overrides
  };
}

describe("screening provider orchestration", () => {
  it("keeps committed owner work isolated from an uncommitted owner runtime", async () => {
    const committed = createScreeningOwnerCoordinator("user-1");
    const committedToken = committed.begin();
    const speculative = createScreeningOwnerCoordinator("user-2");
    const speculativeToken = speculative.begin();
    speculative.invalidate(speculativeToken);
    const persisted = vi.fn(async () => undefined);

    expect(committed.isCurrent(committedToken)).toBe(true);
    expect(await committed.runExclusive(committedToken, persisted)).toBe(true);
    expect(persisted).toHaveBeenCalledOnce();
  });

  it("hydrates guest data and migrates the legacy cache before publishing it", async () => {
    const legacy = [result("legacy")];
    const coordinator = new ScreeningOperationCoordinator("guest");
    const token = coordinator.begin();
    const onResults = vi.fn();
    const dependencies = hydrationDependencies({ loadLegacyCache: vi.fn(async () => legacy) });

    await hydrateScreeningState({ coordinator, token, authenticated: false, dependencies, onResults });

    expect(dependencies.migrateLegacyCache).toHaveBeenCalledWith(legacy);
    expect(onResults).toHaveBeenCalledWith(legacy);
    expect(dependencies.loadServerHistory).not.toHaveBeenCalled();
  });

  it("publishes authenticated cache then replaces and persists it with server history", async () => {
    const cached = [result("cached")];
    const history = [result("server")];
    const coordinator = new ScreeningOperationCoordinator("user-1");
    const token = coordinator.begin();
    const onResults = vi.fn();
    const dependencies = hydrationDependencies({
      loadOwnerCache: vi.fn(async () => cached),
      loadServerHistory: vi.fn(async () => history)
    });

    await hydrateScreeningState({ coordinator, token, authenticated: true, dependencies, onResults });

    expect(onResults.mock.calls).toEqual([[cached], [history]]);
    expect(dependencies.persistOwnerCache).toHaveBeenCalledWith(history);
    expect(dependencies.loadLegacyCache).not.toHaveBeenCalled();
  });

  it("enqueues and persists a guest submission", async () => {
    const local = result("local");
    const existing = [result("existing")];
    const coordinator = new ScreeningOperationCoordinator("guest");
    const token = coordinator.begin();
    const enqueueGuest = vi.fn(async () => undefined);
    const persistOwnerCache = vi.fn(async () => undefined);
    const onResults = vi.fn();

    const saved = await saveScreeningState({
      coordinator,
      token,
      authenticated: false,
      localResult: local,
      dependencies: {
        submitAuthenticated: vi.fn(async () => result("remote")),
        enqueueGuest,
        persistOwnerCache
      },
      getResults: () => existing,
      onResults
    });

    expect(saved).toBe(local);
    expect(enqueueGuest).toHaveBeenCalledOnce();
    expect(persistOwnerCache).toHaveBeenCalledWith([local, ...existing]);
    expect(onResults).toHaveBeenCalledWith([local, ...existing]);
  });

  it("drops a stale hydration completion after an owner change", async () => {
    const cache = deferred<ScreeningResult[] | null>();
    const coordinator = new ScreeningOperationCoordinator("user-1");
    const token = coordinator.begin();
    const onResults = vi.fn();
    const dependencies = hydrationDependencies({ loadOwnerCache: vi.fn(() => cache.promise) });
    const hydration = hydrateScreeningState({ coordinator, token, authenticated: true, dependencies, onResults });

    coordinator.invalidate(token);
    createScreeningOwnerCoordinator("user-2");
    cache.resolve([result("stale")]);
    await hydration;

    expect(onResults).not.toHaveBeenCalled();
    expect(dependencies.loadServerHistory).not.toHaveBeenCalled();
    expect(dependencies.persistOwnerCache).not.toHaveBeenCalled();
  });

  it("does not persist an authenticated save that completes after an owner change", async () => {
    const submission = deferred<ScreeningResult>();
    const coordinator = new ScreeningOperationCoordinator("user-1");
    const token = coordinator.begin();
    const persistOwnerCache = vi.fn(async () => undefined);
    const onResults = vi.fn();
    const saving = saveScreeningState({
      coordinator,
      token,
      authenticated: true,
      localResult: result("local"),
      dependencies: {
        submitAuthenticated: vi.fn(() => submission.promise),
        enqueueGuest: vi.fn(async () => undefined),
        persistOwnerCache
      },
      getResults: () => [],
      onResults
    });

    coordinator.invalidate(token);
    createScreeningOwnerCoordinator("user-2");
    submission.resolve(result("stale-save"));
    await saving;

    expect(persistOwnerCache).not.toHaveBeenCalled();
    expect(onResults).not.toHaveBeenCalled();
  });

  it("invalidates deferred history when clear wins the hydration race", async () => {
    const history = deferred<ScreeningResult[] | null>();
    const coordinator = new ScreeningOperationCoordinator("user-1");
    const token = coordinator.begin();
    const onResults = vi.fn();
    const removed = vi.fn(async () => undefined);
    const dependencies = hydrationDependencies({
      loadOwnerCache: vi.fn(async () => [result("cached")]),
      loadServerHistory: vi.fn(() => history.promise)
    });
    const hydration = hydrateScreeningState({ coordinator, token, authenticated: true, dependencies, onResults });
    await vi.waitFor(() => expect(onResults).toHaveBeenCalledWith([result("cached")]));

    await coordinator.clear(removed);
    history.resolve([result("stale-history")]);
    await hydration;

    expect(removed).toHaveBeenCalledOnce();
    expect(dependencies.persistOwnerCache).not.toHaveBeenCalled();
    expect(onResults).toHaveBeenCalledTimes(1);
  });

  it("serializes clear after an already-started save persistence", async () => {
    const writeGate = deferred<void>();
    const coordinator = new ScreeningOperationCoordinator("user-1");
    const token = coordinator.begin();
    const remote = result("remote");
    let stored: ScreeningResult[] | null = null;
    const persistStarted = deferred<void>();
    const onResults = vi.fn();
    const saving = saveScreeningState({
      coordinator,
      token,
      authenticated: true,
      localResult: result("local"),
      dependencies: {
        submitAuthenticated: vi.fn(async () => remote),
        enqueueGuest: vi.fn(async () => undefined),
        persistOwnerCache: async (results) => {
          persistStarted.resolve();
          await writeGate.promise;
          stored = results;
        }
      },
      getResults: () => [],
      onResults
    });
    await persistStarted.promise;
    const clearing = coordinator.clear(async () => { stored = null; });

    writeGate.resolve();
    await Promise.all([saving, clearing]);

    expect(stored).toBeNull();
    expect(onResults).not.toHaveBeenCalled();
  });

  it("serializes concurrent save read-modify-persist-publish transactions", async () => {
    const coordinator = new ScreeningOperationCoordinator("user-1");
    const token = coordinator.begin();
    const firstWriteGate = deferred<void>();
    const firstWriteStarted = deferred<void>();
    const persisted: ScreeningResult[][] = [];
    let currentResults: ScreeningResult[] = [];
    let writeCount = 0;
    const dependencies = {
      enqueueGuest: vi.fn(async () => undefined),
      persistOwnerCache: async (results: ScreeningResult[]) => {
        writeCount += 1;
        persisted.push(results);
        if (writeCount === 1) {
          firstWriteStarted.resolve();
          await firstWriteGate.promise;
        }
      }
    };
    const save = (saved: ScreeningResult) => saveScreeningState({
      coordinator,
      token,
      authenticated: true,
      localResult: result("local"),
      dependencies: {
        ...dependencies,
        submitAuthenticated: vi.fn(async () => saved)
      },
      getResults: () => currentResults,
      onResults: (results) => { currentResults = results; }
    });

    const first = save(result("first"));
    const second = save(result("second"));
    await firstWriteStarted.promise;
    firstWriteGate.resolve();
    await Promise.all([first, second]);

    expect(persisted).toEqual([
      [result("first")],
      [result("second"), result("first")]
    ]);
    expect(currentResults).toEqual([result("second"), result("first")]);
  });

  it("publishes hydrated history before a queued save reads and persists results", async () => {
    const coordinator = new ScreeningOperationCoordinator("user-1");
    const token = coordinator.begin();
    const hydrationWriteGate = deferred<void>();
    const hydrationWriteStarted = deferred<void>();
    const hydrated = result("hydrated");
    const saved = result("saved");
    let currentResults: ScreeningResult[] = [];
    let storedResults: ScreeningResult[] = [];
    const hydration = hydrateScreeningState({
      coordinator,
      token,
      authenticated: true,
      dependencies: hydrationDependencies({
        loadServerHistory: vi.fn(async () => [hydrated]),
        persistOwnerCache: vi.fn(async (results) => {
          hydrationWriteStarted.resolve();
          await hydrationWriteGate.promise;
          storedResults = results;
        })
      }),
      onResults: (results) => { currentResults = results; }
    });
    await hydrationWriteStarted.promise;

    const saving = saveScreeningState({
      coordinator,
      token,
      authenticated: true,
      localResult: result("local"),
      dependencies: {
        submitAuthenticated: vi.fn(async () => saved),
        enqueueGuest: vi.fn(async () => undefined),
        persistOwnerCache: async (results) => { storedResults = results; }
      },
      getResults: () => currentResults,
      onResults: (results) => { currentResults = results; }
    });

    hydrationWriteGate.resolve();
    await Promise.all([hydration, saving]);

    expect(currentResults).toEqual([saved, hydrated]);
    expect(storedResults).toEqual([saved, hydrated]);
  });
});
