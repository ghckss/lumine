import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Gender, LoginSession, UserProfile } from "./session";
import type { NativeProviderName } from "../providers/types";
import { deleteSession, loginSession, logoutSession, restoreSession } from "./session-lifecycle";
import type { SessionServices } from "./session-lifecycle";

export type GuestMigrationState = {
  phase: "idle" | "prompt" | "syncing" | "completed" | "needs_attention" | "declined";
  totalCount: number;
  syncedCount: number;
  conflictCount: number;
  failedCount: number;
};

type SessionContextValue = {
  isRestoring: boolean;
  session: LoginSession | null;
  profile: UserProfile | null;
  guestMigration: GuestMigrationState;
  contentRevision: number;
  login: (provider: NativeProviderName) => Promise<void>;
  completeProfile: (input: { gender: Gender; birthDate: string; agreedToTerms: boolean }) => Promise<void>;
  requestGuestMigration: () => Promise<void>;
  startGuestMigration: () => Promise<void>;
  dismissGuestMigration: () => void;
  deleteAccount: () => Promise<void>;
  logout: () => Promise<void>;
};

const EMPTY_MIGRATION: GuestMigrationState = {
  phase: "idle",
  totalCount: 0,
  syncedCount: 0,
  conflictCount: 0,
  failedCount: 0
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children, services }: { children: React.ReactNode; services: SessionServices }) {
  const [isRestoring, setIsRestoring] = useState(true);
  const [session, setSession] = useState<LoginSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guestMigration, setGuestMigration] = useState<GuestMigrationState>(EMPTY_MIGRATION);
  const [contentRevision, setContentRevision] = useState(0);

  useEffect(() => {
    restoreSession(services, { onSession: setSession, onProfile: setProfile })
      .then(({ pendingGuestCount }) => {
        if (pendingGuestCount > 0) {
          setGuestMigration({ ...EMPTY_MIGRATION, phase: "prompt", totalCount: pendingGuestCount });
        }
      })
      .finally(() => setIsRestoring(false));
  }, [services]);

  const login = useCallback(async (provider: NativeProviderName) => {
    const result = await loginSession(services, provider, { onSession: setSession, onProfile: setProfile });
    if (!result.profile) return;
    setGuestMigration(result.pendingGuestCount > 0
      ? { ...EMPTY_MIGRATION, phase: "prompt", totalCount: result.pendingGuestCount }
      : EMPTY_MIGRATION);
  }, [services]);

  const requestGuestMigration = useCallback(async () => {
    const count = await services.loadPendingGuestCount();
    setGuestMigration(count > 0
      ? { ...guestMigration, phase: "prompt", totalCount: count }
      : EMPTY_MIGRATION);
  }, [guestMigration, services]);

  const startGuestMigration = useCallback(async () => {
    const count = await services.loadPendingGuestCount();
    if (count === 0) {
      setGuestMigration(EMPTY_MIGRATION);
      return;
    }

    setGuestMigration({ ...EMPTY_MIGRATION, phase: "syncing", totalCount: count });
    try {
      const result = await services.migrateGuestContent();
      const nextState: GuestMigrationState = {
        phase: result.remainingCount === 0 ? "completed" : "needs_attention",
        totalCount: result.totalCount,
        syncedCount: result.syncedCount,
        conflictCount: result.conflictCount,
        failedCount: result.failedCount
      };
      setGuestMigration((current) => current.phase === "declined"
        ? result.remainingCount === 0 ? EMPTY_MIGRATION : { ...nextState, phase: "declined" }
        : nextState);
      if (result.syncedCount > 0) setContentRevision((current) => current + 1);
    } catch {
      const failedState: GuestMigrationState = {
        ...EMPTY_MIGRATION,
        phase: "needs_attention",
        totalCount: count,
        failedCount: count
      };
      setGuestMigration((current) => current.phase === "declined"
        ? { ...failedState, phase: "declined" }
        : failedState);
    }
  }, [services]);

  const dismissGuestMigration = useCallback(() => {
    setGuestMigration((current) => current.phase === "completed"
      ? EMPTY_MIGRATION
      : { ...current, phase: "declined" });
  }, []);

  const completeProfile = useCallback(
    async (input: { gender: Gender; birthDate: string; agreedToTerms: boolean }) => {
      if (!session) throw new Error("No session");

      setProfile(await services.saveProfile({
        provider: session.provider,
        displayName: session.displayName,
        gender: input.gender,
        birthDate: input.birthDate,
        agreedToTerms: input.agreedToTerms
      }));
    },
    [services, session]
  );

  const logout = useCallback(async () => {
    await logoutSession(services, session?.provider, {
      onSessionCleared: () => setSession(null),
      onRemainingStateCleared: () => {
        setProfile(null);
        setGuestMigration(EMPTY_MIGRATION);
      }
    });
  }, [services, session?.provider]);

  const deleteAccount = useCallback(async () => {
    if (!session) throw new Error("No session");

    await deleteSession(services, session);
    setSession(null);
    setProfile(null);
    setGuestMigration(EMPTY_MIGRATION);
  }, [services, session]);

  const value = useMemo(
    () => ({
      isRestoring,
      session,
      profile,
      guestMigration,
      contentRevision,
      login,
      completeProfile,
      requestGuestMigration,
      startGuestMigration,
      dismissGuestMigration,
      deleteAccount,
      logout
    }),
    [completeProfile, contentRevision, deleteAccount, dismissGuestMigration, guestMigration, isRestoring, login, logout, profile, requestGuestMigration, session, startGuestMigration]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within SessionProvider");
  return context;
}

export type { SessionServices } from "./session-lifecycle";
