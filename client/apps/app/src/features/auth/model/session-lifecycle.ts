import type { Gender, LoginSession, UserProfile } from "./session";
import type { NativeProviderName } from "../providers/types";

export type GuestMigrationResult = {
  totalCount: number;
  syncedCount: number;
  conflictCount: number;
  failedCount: number;
  remainingCount: number;
};

export type SessionServices = {
  loadStoredSession: () => Promise<LoginSession | null>;
  saveStoredSession: (session: LoginSession) => Promise<void>;
  clearStoredSession: () => Promise<void>;
  configureAccessToken: (token: string | null) => void;
  loginWithNativeProvider: (provider: NativeProviderName) => Promise<LoginSession>;
  logoutFromNativeProvider: (provider: LoginSession["provider"] | undefined | null) => Promise<void>;
  logoutRemote: () => Promise<unknown>;
  loadProfile: () => Promise<UserProfile>;
  saveProfile: (input: {
    provider: LoginSession["provider"];
    displayName: string;
    gender: Gender;
    birthDate: string;
    agreedToTerms: boolean;
  }) => Promise<UserProfile>;
  deleteRemoteAccount: () => Promise<unknown>;
  clearUserContent: (userId: string) => Promise<void>;
  loadPendingGuestCount: () => Promise<number>;
  migrateGuestContent: () => Promise<GuestMigrationResult>;
};

export type SessionLoadResult = {
  session: LoginSession | null;
  profile: UserProfile | null;
  pendingGuestCount: number;
};

type SessionLoadHandlers = {
  onSession: (session: LoginSession) => void;
  onProfile: (profile: UserProfile | null) => void;
};

export async function restoreSession(
  services: SessionServices,
  handlers: SessionLoadHandlers
): Promise<SessionLoadResult> {
  const session = await services.loadStoredSession();
  if (!session) return { session: null, profile: null, pendingGuestCount: 0 };

  handlers.onSession(session);
  services.configureAccessToken(session.accessToken);
  try {
    const profile = await services.loadProfile();
    handlers.onProfile(profile);
    const pendingGuestCount = await services.loadPendingGuestCount().catch(() => 0);
    return { session, profile, pendingGuestCount };
  } catch {
    handlers.onProfile(null);
    return { session, profile: null, pendingGuestCount: 0 };
  }
}

export async function loginSession(
  services: SessionServices,
  provider: NativeProviderName,
  handlers: SessionLoadHandlers
): Promise<SessionLoadResult> {
  const session = await services.loginWithNativeProvider(provider);
  services.configureAccessToken(session.accessToken);
  await services.saveStoredSession(session);
  handlers.onSession(session);

  try {
    const profile = await services.loadProfile();
    handlers.onProfile(profile);
    const pendingGuestCount = await services.loadPendingGuestCount().catch(() => 0);
    return { session, profile, pendingGuestCount };
  } catch {
    handlers.onProfile(null);
    return { session, profile: null, pendingGuestCount: 0 };
  }
}

export async function logoutSession(
  services: SessionServices,
  provider: LoginSession["provider"] | undefined,
  handlers: { onSessionCleared: () => void; onRemainingStateCleared: () => void }
) {
  await services.logoutRemote().catch(() => undefined);
  await services.logoutFromNativeProvider(provider);
  handlers.onSessionCleared();
  services.configureAccessToken(null);
  handlers.onRemainingStateCleared();
  await services.clearStoredSession();
}

export async function deleteSession(services: SessionServices, session: LoginSession) {
  await services.deleteRemoteAccount();
  await services.logoutFromNativeProvider(session.provider).catch(() => undefined);
  await services.clearUserContent(session.userId);
  await services.clearStoredSession().catch(() => undefined);
  services.configureAccessToken(null);
}
