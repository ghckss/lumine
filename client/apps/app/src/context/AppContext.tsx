import React, { createContext, useCallback, useContext, useMemo } from "react";
import { AppRouteScope, useNavigation } from "../app/navigation/NavigationProvider";
import { STACK_TRANSITION_MS } from "../app/navigation/navigation-state";
import { JournalProvider, useJournal, type JournalContextValue } from "../features/journal";
import {
  ScreeningProvider,
  useScreening,
  type ScreeningContextValue
} from "../features/screening";
export { AppRouteScope, STACK_TRANSITION_MS };

type AppContextValue = JournalContextValue & Pick<ScreeningContextValue,
  "isScreeningLoading" | "screeningResults" | "screeningOwner" | "saveScreening" | "clearScreeningContent"
> & {
  isGuest: boolean;
  isLoading: boolean;
  clearContent: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children, isGuest }: { children: React.ReactNode; isGuest: boolean }) {
  return (
    <JournalProvider>
      <ScreeningProvider>
        <AppContentProvider isGuest={isGuest}>{children}</AppContentProvider>
      </ScreeningProvider>
    </JournalProvider>
  );
}

function AppContentProvider({ children, isGuest }: { children: React.ReactNode; isGuest: boolean }) {
  const journal = useJournal();
  const screening = useScreening();

  const clearContent = useCallback(async () => {
    await Promise.all([
      journal.clearJournalContent(),
      screening.clearScreeningContent()
    ]);
  }, [journal, screening]);

  const value = useMemo(() => ({
    ...journal,
    ...screening,
    isGuest,
    isLoading: journal.isJournalLoading || screening.isScreeningLoading,
    clearContent
  }), [clearContent, isGuest, journal, screening]);

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
