import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppRouteScope, useNavigation } from "../app/navigation/NavigationProvider";
import { STACK_TRANSITION_MS } from "../app/navigation/navigation-state";
import { useSession } from "../features/auth/model/SessionProvider";
import { JournalProvider, useJournal, type JournalContextValue } from "../features/journal";
import { screeningApi } from "../features/screening/api/screening-api";
import { loadDeviceCache, removeDeviceCache, saveDeviceCache } from "../shared/storage/device-cache";
import { enqueuePendingSync } from "../storage/pending-sync";
import type { ScreeningResult } from "../features/screening/model/screening";

const LEGACY_SCREENING_CACHE_KEY = "native.screening.results";
const screeningCacheKey = (owner: string) => `native.screening.results.${owner}`;
export { AppRouteScope, STACK_TRANSITION_MS };

type AppContextValue = JournalContextValue & {
  isGuest: boolean;
  isLoading: boolean;
  screeningResults: ScreeningResult[];
  saveScreening: (answers: Record<string, string>, localResult: ScreeningResult) => Promise<ScreeningResult>;
  clearContent: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children, isGuest }: { children: React.ReactNode; isGuest: boolean }) {
  return (
    <JournalProvider>
      <AppContentProvider isGuest={isGuest}>{children}</AppContentProvider>
    </JournalProvider>
  );
}

function AppContentProvider({ children, isGuest }: { children: React.ReactNode; isGuest: boolean }) {
  const { session, contentRevision } = useSession();
  const cacheOwner = session?.userId ?? "guest";
  const journal = useJournal();
  const ownerScreeningCacheKey = screeningCacheKey(cacheOwner);
  const [screeningResults, setScreeningResults] = useState<ScreeningResult[]>([]);
  const [isScreeningLoading, setIsScreeningLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsScreeningLoading(true);
      let cachedScreenings = await loadDeviceCache<ScreeningResult[]>(ownerScreeningCacheKey);
      if (!session && !cachedScreenings) {
        cachedScreenings = await loadDeviceCache<ScreeningResult[]>(LEGACY_SCREENING_CACHE_KEY);
        await Promise.all([
          saveDeviceCache(ownerScreeningCacheKey, cachedScreenings ?? []),
          removeDeviceCache(LEGACY_SCREENING_CACHE_KEY)
        ]);
      }

      if (mounted) setScreeningResults(cachedScreenings ?? []);

      if (session) {
        const serverScreenings = await screeningApi.getScreeningHistory().catch(() => null);
        if (mounted && serverScreenings) {
          const mapped = serverScreenings.map((result, index) => ({
            id: `screening:${result.completedDate}:${index}`,
            completedDate: result.completedDate,
            publicSummary: result.publicSummary,
            publicComfortMessage: "오늘 내 마음을 돌아본 것만으로도 충분히 의미 있어요.",
            recommendedActions: [],
            recommendedRescreenAt: result.recommendedRescreenAt,
            requiresSafetyPrompt: result.requiresSafetyPrompt,
            comparisonScore: result.comparisonScore
          }));
          setScreeningResults(mapped);
          await saveDeviceCache(ownerScreeningCacheKey, mapped);
        }
      }
    }

    void load()
      .catch(() => undefined)
      .finally(() => { if (mounted) setIsScreeningLoading(false); });
    return () => { mounted = false; };
  }, [cacheOwner, contentRevision, ownerScreeningCacheKey, session]);

  const saveScreening = useCallback(async (answers: Record<string, string>, localResult: ScreeningResult) => {
    let result = localResult;
    if (session) {
      const serverResult = await screeningApi.submitScreening({ answers });
      result = {
        ...serverResult,
        id: `screening:${Date.now()}`,
        completedDate: new Date().toISOString().slice(0, 10)
      };
    } else {
      await enqueuePendingSync({ id: localResult.id, type: "screening", payload: { answers } });
    }

    const next = [result, ...screeningResults];
    setScreeningResults(next);
    await saveDeviceCache(ownerScreeningCacheKey, next);
    return result;
  }, [ownerScreeningCacheKey, screeningResults, session]);

  const clearContent = useCallback(async () => {
    setScreeningResults([]);
    await Promise.all([
      journal.clearJournalContent(),
      removeDeviceCache(ownerScreeningCacheKey)
    ]);
  }, [journal, ownerScreeningCacheKey]);

  const value = useMemo(() => ({
    ...journal,
    isGuest,
    isLoading: journal.isJournalLoading || isScreeningLoading,
    screeningResults,
    saveScreening,
    clearContent
  }), [clearContent, isGuest, isScreeningLoading, journal, saveScreening, screeningResults]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  const navigation = useNavigation();
  if (!context) throw new Error("useApp must be used within AppProvider");
  return { ...context, ...navigation };
}
