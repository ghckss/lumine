import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "../../auth";
import { loadDeviceCache, removeDeviceCache, saveDeviceCache } from "../../../shared/storage/device-cache";
import { enqueuePendingSync } from "../../../shared/storage/pending-sync";
import { screeningApi } from "../api/screening-api";
import {
  LEGACY_SCREENING_RESULTS_CACHE_KEY,
  screeningResultsCacheKey
} from "../storage/screening-cache";
import type { ScreeningResult } from "./screening";
import { mapScreeningHistory } from "./screening-results";
import {
  hydrateScreeningState,
  saveScreeningState,
  createScreeningOwnerCoordinator
} from "./screening-orchestration";

export type ScreeningContextValue = {
  isScreeningLoading: boolean;
  screeningResults: ScreeningResult[];
  screeningOwner: string;
  saveScreening: (answers: Record<string, string>, localResult: ScreeningResult) => Promise<ScreeningResult>;
  clearScreeningContent: () => Promise<void>;
};

const ScreeningContext = createContext<ScreeningContextValue | null>(null);

export function ScreeningProvider({ children }: { children: React.ReactNode }) {
  const { session, contentRevision } = useSession();
  const owner = session?.userId ?? "guest";
  return (
    <OwnerScreeningProvider
      key={owner}
      owner={owner}
      authenticated={Boolean(session)}
      contentRevision={contentRevision}
    >
      {children}
    </OwnerScreeningProvider>
  );
}

function OwnerScreeningProvider({
  children,
  owner,
  authenticated,
  contentRevision
}: {
  children: React.ReactNode;
  owner: string;
  authenticated: boolean;
  contentRevision: number;
}) {
  const [coordinator] = useState(() => createScreeningOwnerCoordinator(owner));
  const resultsRef = useRef<ScreeningResult[]>([]);
  const resultsCacheKey = screeningResultsCacheKey(owner);
  const [screeningResults, setScreeningResults] = useState<ScreeningResult[]>([]);
  const [isScreeningLoading, setIsScreeningLoading] = useState(true);

  const applyResults = useCallback((results: ScreeningResult[]) => {
    resultsRef.current = results;
    setScreeningResults(results);
  }, []);

  useEffect(() => {
    const token = coordinator.begin();

    async function hydrate() {
      setIsScreeningLoading(true);
      applyResults([]);
      await hydrateScreeningState({
        coordinator,
        token,
        authenticated,
        dependencies: {
          loadOwnerCache: () => loadDeviceCache<ScreeningResult[]>(resultsCacheKey),
          loadLegacyCache: () => loadDeviceCache<ScreeningResult[]>(LEGACY_SCREENING_RESULTS_CACHE_KEY),
          migrateLegacyCache: async (results) => {
            await Promise.all([
              saveDeviceCache(resultsCacheKey, results),
              removeDeviceCache(LEGACY_SCREENING_RESULTS_CACHE_KEY)
            ]);
          },
          loadServerHistory: async () => {
            const history = await screeningApi.getScreeningHistory().catch(() => null);
            return history ? mapScreeningHistory(history) : null;
          },
          persistOwnerCache: (results) => saveDeviceCache(resultsCacheKey, results)
        },
        onResults: applyResults
      });
    }

    void hydrate().catch(() => undefined).finally(() => {
      coordinator.commit(token, () => setIsScreeningLoading(false));
    });
    return () => coordinator.invalidate(token);
  }, [applyResults, authenticated, contentRevision, coordinator, owner, resultsCacheKey]);

  const saveScreening = useCallback(async (answers: Record<string, string>, localResult: ScreeningResult) => {
    const token = coordinator.currentToken();
    return saveScreeningState({
      coordinator,
      token,
      authenticated,
      localResult,
      dependencies: {
        submitAuthenticated: async () => ({
          ...await screeningApi.submitScreening({ answers }),
          id: `screening:${Date.now()}`,
          completedDate: new Date().toISOString().slice(0, 10)
        }),
        enqueueGuest: () => enqueuePendingSync({ id: localResult.id, type: "screening", payload: { answers } }),
        persistOwnerCache: (results) => saveDeviceCache(resultsCacheKey, results)
      },
      getResults: () => resultsRef.current,
      onResults: applyResults
    });
  }, [applyResults, authenticated, coordinator, resultsCacheKey]);

  const clearScreeningContent = useCallback(async () => {
    applyResults([]);
    setIsScreeningLoading(false);
    await coordinator.clear(() => removeDeviceCache(resultsCacheKey));
  }, [applyResults, coordinator, resultsCacheKey]);

  const value = useMemo<ScreeningContextValue>(() => ({
    isScreeningLoading,
    screeningResults,
    screeningOwner: owner,
    saveScreening,
    clearScreeningContent
  }), [clearScreeningContent, isScreeningLoading, owner, saveScreening, screeningResults]);

  return <ScreeningContext.Provider value={value}>{children}</ScreeningContext.Provider>;
}

export function useScreening() {
  const context = useContext(ScreeningContext);
  if (!context) throw new Error("useScreening must be used within ScreeningProvider");
  return context;
}
