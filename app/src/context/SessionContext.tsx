import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginWithNativeProvider, logoutFromNativeProvider } from "../auth/auth-service";
import { api } from "../lib/api";
import { clearSession, loadSession, saveSession } from "../storage/secure-store";
import type { Gender, LoginSession, UserProfile } from "../types/session";

type SessionContextValue = {
  isRestoring: boolean;
  session: LoginSession | null;
  profile: UserProfile | null;
  login: (provider: "kakao" | "google") => Promise<void>;
  completeProfile: (input: { gender: Gender; birthDate: string; agreedToTerms: boolean }) => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isRestoring, setIsRestoring] = useState(true);
  const [session, setSession] = useState<LoginSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadSession()
      .then(async (storedSession) => {
        if (!storedSession) {
          return;
        }

        setSession(storedSession);

        try {
          const me = await api.getMe();
          setProfile(me);
        } catch {
          setProfile(null);
        }
      })
      .finally(() => setIsRestoring(false));
  }, []);

  const login = useCallback(async (provider: "kakao" | "google") => {
    const nextSession = await loginWithNativeProvider(provider);
    setSession(nextSession);
    await saveSession(nextSession);

    try {
      const me = await api.getMe();
      setProfile(me);
    } catch {
      setProfile(null);
    }
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
    setProfile(null);
    await clearSession();
  }, [session?.provider]);

  const value = useMemo(
    () => ({
      isRestoring,
      session,
      profile,
      login,
      completeProfile,
      logout
    }),
    [completeProfile, isRestoring, login, logout, profile, session]
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
