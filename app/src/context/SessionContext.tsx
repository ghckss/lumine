import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginWithNativeProvider, logoutFromNativeProvider } from "../auth/auth-service";
import { api, configureApiAccessToken } from "../lib/api";
import { syncGuestContentToServer } from "../lib/content-sync";
import { loadPendingSyncQueue } from "../storage/pending-sync";
import { contentCacheKeys, removeDeviceCache } from "../storage/device-cache";
import { clearSession, loadSession, saveSession } from "../storage/secure-store";
import type { Gender, LoginSession, UserProfile } from "../types/session";

type SessionContextValue = {
  isRestoring: boolean;
  session: LoginSession | null;
  profile: UserProfile | null;
  guestMigration: GuestMigrationState;
  contentRevision: number;
  login: (provider: "kakao" | "google") => Promise<void>;
  completeProfile: (input: { gender: Gender; birthDate: string; agreedToTerms: boolean }) => Promise<void>;
  requestGuestMigration: () => Promise<void>;
  startGuestMigration: () => Promise<void>;
  dismissGuestMigration: () => void;
  deleteAccount: () => Promise<void>;
  logout: () => Promise<void>;
};

export type GuestMigrationState = {
  phase: "idle" | "prompt" | "syncing" | "completed" | "needs_attention" | "declined";
  totalCount: number;
  syncedCount: number;
  conflictCount: number;
  failedCount: number;
};

const EMPTY_MIGRATION: GuestMigrationState = {
  phase: "idle",
  totalCount: 0,
  syncedCount: 0,
  conflictCount: 0,
  failedCount: 0
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isRestoring, setIsRestoring] = useState(true);
  const [session, setSession] = useState<LoginSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guestMigration, setGuestMigration] = useState<GuestMigrationState>(EMPTY_MIGRATION);
  const [contentRevision, setContentRevision] = useState(0);

  useEffect(() => {
    loadSession()
      .then(async (storedSession) => {
        if (!storedSession) {
          return;
        }

        setSession(storedSession);
        configureApiAccessToken(storedSession.accessToken);

        try {
          const me = await api.getMe();
          setProfile(me);
        } catch {
          setProfile(null);
          return;
        }

        const queue = await loadPendingSyncQueue().catch(() => []);
        if (queue.length > 0) {
          setGuestMigration({ ...EMPTY_MIGRATION, phase: "prompt", totalCount: queue.length });
        }
      })
      .finally(() => setIsRestoring(false));
  }, []);

  const login = useCallback(async (provider: "kakao" | "google") => {
    const nextSession = await loginWithNativeProvider(provider);
    configureApiAccessToken(nextSession.accessToken);
    await saveSession(nextSession);
    setSession(nextSession);

    try {
      const me = await api.getMe();
      setProfile(me);
    } catch {
      setProfile(null);
      return;
    }

    const queue = await loadPendingSyncQueue().catch(() => []);
    setGuestMigration(queue.length > 0
      ? { ...EMPTY_MIGRATION, phase: "prompt", totalCount: queue.length }
      : EMPTY_MIGRATION);

  }, []);

  const requestGuestMigration = useCallback(async () => {
    const queue = await loadPendingSyncQueue();
    setGuestMigration(queue.length > 0
      ? { ...guestMigration, phase: "prompt", totalCount: queue.length }
      : EMPTY_MIGRATION);
  }, [guestMigration]);

  const startGuestMigration = useCallback(async () => {
    const queue = await loadPendingSyncQueue();
    if (queue.length === 0) {
      setGuestMigration(EMPTY_MIGRATION);
      return;
    }

    setGuestMigration({ ...EMPTY_MIGRATION, phase: "syncing", totalCount: queue.length });
    try {
      const result = await syncGuestContentToServer();
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
        totalCount: queue.length,
        failedCount: queue.length
      };
      setGuestMigration((current) => current.phase === "declined"
        ? { ...failedState, phase: "declined" }
        : failedState);
    }
  }, []);

  const dismissGuestMigration = useCallback(() => {
    setGuestMigration((current) => current.phase === "completed"
      ? EMPTY_MIGRATION
      : { ...current, phase: "declined" });
  }, []);

  const completeProfile = useCallback(
    async (input: { gender: Gender; birthDate: string; agreedToTerms: boolean }) => {
      if (!session) {
        throw new Error("No session");
      }

      const nextProfile = await api.upsertProfile({
        provider: session.provider,
        displayName: session.displayName,
        gender: input.gender,
        birthDate: input.birthDate,
        agreedToTerms: input.agreedToTerms
      });

      setProfile(nextProfile);
    },
    [session]
  );

  const logout = useCallback(async () => {
    const currentProvider = session?.provider;

    try {
      await api.logout();
    } catch {
      // Ignore logout failures for the shell state.
    }

    await logoutFromNativeProvider(currentProvider);

    setSession(null);
    configureApiAccessToken(null);
    setProfile(null);
    setGuestMigration(EMPTY_MIGRATION);
    await clearSession();
  }, [session?.provider]);

  const deleteAccount = useCallback(async () => {
    if (!session) throw new Error("No session");

    await api.deleteMe();
    await logoutFromNativeProvider(session.provider).catch(() => undefined);
    await Promise.all(contentCacheKeys(session.userId).map((key) => removeDeviceCache(key).catch(() => undefined)));
    await clearSession().catch(() => undefined);
    configureApiAccessToken(null);
    setSession(null);
    setProfile(null);
    setGuestMigration(EMPTY_MIGRATION);
  }, [session]);

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
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
