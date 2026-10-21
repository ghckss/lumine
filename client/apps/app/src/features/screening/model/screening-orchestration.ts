import type { ScreeningResult } from "./screening";

export type ScreeningOperationToken = Readonly<{ owner: string; generation: number }>;

export class ScreeningOperationCoordinator {
  private readonly owner: string;
  private generation = 0;
  private persistence: Promise<void> = Promise.resolve();

  constructor(owner: string) {
    this.owner = owner;
  }

  begin() {
    this.generation += 1;
    return this.currentToken();
  }

  currentToken(): ScreeningOperationToken {
    return { owner: this.owner, generation: this.generation };
  }

  isCurrent(token: ScreeningOperationToken) {
    return token.owner === this.owner && token.generation === this.generation;
  }

  invalidate(token?: ScreeningOperationToken) {
    if (!token || this.isCurrent(token)) this.generation += 1;
  }

  commit(token: ScreeningOperationToken, action: () => void) {
    if (!this.isCurrent(token)) return false;
    action();
    return true;
  }

  async runExclusive(token: ScreeningOperationToken, action: () => Promise<void>) {
    let persisted = false;
    const run = async () => {
      if (!this.isCurrent(token)) return;
      await action();
      persisted = this.isCurrent(token);
    };
    this.persistence = this.persistence.then(run, run);
    await this.persistence;
    return persisted;
  }

  async clear(action: () => Promise<void>) {
    this.invalidate();
    this.persistence = this.persistence.then(action, action);
    await this.persistence;
  }

}

type HydrationDependencies = {
  loadOwnerCache: () => Promise<ScreeningResult[] | null>;
  loadLegacyCache: () => Promise<ScreeningResult[] | null>;
  migrateLegacyCache: (results: ScreeningResult[]) => Promise<void>;
  loadServerHistory: () => Promise<ScreeningResult[] | null>;
  persistOwnerCache: (results: ScreeningResult[]) => Promise<void>;
};

export async function hydrateScreeningState(options: {
  coordinator: ScreeningOperationCoordinator;
  token: ScreeningOperationToken;
  authenticated: boolean;
  dependencies: HydrationDependencies;
  onResults: (results: ScreeningResult[]) => void;
}) {
  const { coordinator, token, authenticated, dependencies, onResults } = options;
  let cachedResults = await dependencies.loadOwnerCache();
  if (!coordinator.isCurrent(token)) return;

  if (!authenticated && !cachedResults) {
    cachedResults = await dependencies.loadLegacyCache();
    if (!coordinator.isCurrent(token)) return;
    const migrated = cachedResults ?? [];
    await coordinator.runExclusive(token, async () => {
      await dependencies.migrateLegacyCache(migrated);
      coordinator.commit(token, () => onResults(migrated));
    });
    return;
  }

  coordinator.commit(token, () => onResults(cachedResults ?? []));

  if (!authenticated) return;
  const serverResults = await dependencies.loadServerHistory();
  if (!serverResults || !coordinator.isCurrent(token)) return;
  await coordinator.runExclusive(token, async () => {
    await dependencies.persistOwnerCache(serverResults);
    coordinator.commit(token, () => onResults(serverResults));
  });
}

type SaveDependencies = {
  submitAuthenticated: () => Promise<ScreeningResult>;
  enqueueGuest: () => Promise<void>;
  persistOwnerCache: (results: ScreeningResult[]) => Promise<void>;
};

export async function saveScreeningState(options: {
  coordinator: ScreeningOperationCoordinator;
  token: ScreeningOperationToken;
  authenticated: boolean;
  localResult: ScreeningResult;
  dependencies: SaveDependencies;
  getResults: () => ScreeningResult[];
  onResults: (results: ScreeningResult[]) => void;
}) {
  const { coordinator, token, authenticated, localResult, dependencies, getResults, onResults } = options;
  const result = authenticated
    ? await dependencies.submitAuthenticated()
    : await dependencies.enqueueGuest().then(() => localResult);

  if (!coordinator.isCurrent(token)) return result;
  await coordinator.runExclusive(token, async () => {
    const next = [result, ...getResults()];
    await dependencies.persistOwnerCache(next);
    coordinator.commit(token, () => onResults(next));
  });
  return result;
}

export function createScreeningOwnerCoordinator(owner: string) {
  return new ScreeningOperationCoordinator(owner);
}
