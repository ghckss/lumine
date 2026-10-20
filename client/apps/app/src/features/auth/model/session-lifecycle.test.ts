import { describe, expect, it } from "vitest";
import type { LoginSession, UserProfile } from "./session";
import { deleteSession, loginSession, logoutSession, restoreSession } from "./session-lifecycle";
import type { SessionServices } from "./session-lifecycle";

const session: LoginSession = {
  userId: "user-1",
  provider: "GOOGLE",
  displayName: "Lumine User",
  accessToken: "access-1"
};

const profile: UserProfile = {
  userId: session.userId,
  provider: session.provider,
  displayName: session.displayName,
  gender: "OTHER",
  birthDate: "2000-01-01",
  agreedToTerms: true,
  signedUpAt: "2026-10-21T00:00:00.000Z"
};

function createServices(events: string[], overrides: Partial<SessionServices> = {}): SessionServices {
  return {
    loadStoredSession: async () => { events.push("loadStoredSession"); return session; },
    saveStoredSession: async (value) => { events.push(`saveStoredSession:${value.userId}`); },
    clearStoredSession: async () => { events.push("clearStoredSession"); },
    configureAccessToken: (token) => { events.push(`configureAccessToken:${token ?? "null"}`); },
    loginWithNativeProvider: async (provider) => { events.push(`loginWithNativeProvider:${provider}`); return session; },
    logoutFromNativeProvider: async (provider) => { events.push(`logoutFromNativeProvider:${provider ?? "none"}`); },
    logoutRemote: async () => { events.push("logoutRemote"); },
    loadProfile: async () => { events.push("loadProfile"); return profile; },
    saveProfile: async () => profile,
    deleteRemoteAccount: async () => { events.push("deleteRemoteAccount"); },
    clearUserContent: async (userId) => { events.push(`clearUserContent:${userId}`); },
    loadPendingGuestCount: async () => { events.push("loadPendingGuestCount"); return 2; },
    migrateGuestContent: async () => ({ totalCount: 2, syncedCount: 2, conflictCount: 0, failedCount: 0, remainingCount: 0 }),
    ...overrides
  };
}

describe("session lifecycle", () => {
  it("restores the token before profile and guest migration state", async () => {
    const events: string[] = [];
    const result = await restoreSession(createServices(events), {
      onSession: (value) => events.push(`onSession:${value.userId}`),
      onProfile: (value) => events.push(`onProfile:${value?.userId ?? "null"}`)
    });

    expect(result).toEqual({ session, profile, pendingGuestCount: 2 });
    expect(events).toEqual([
      "loadStoredSession",
      "onSession:user-1",
      "configureAccessToken:access-1",
      "loadProfile",
      "onProfile:user-1",
      "loadPendingGuestCount"
    ]);
  });

  it("keeps the restored session but stops migration discovery when profile loading fails", async () => {
    const events: string[] = [];
    const services = createServices(events, {
      loadProfile: async () => { events.push("loadProfile"); throw new Error("profile unavailable"); }
    });

    const result = await restoreSession(services, {
      onSession: (value) => events.push(`onSession:${value.userId}`),
      onProfile: (value) => events.push(`onProfile:${value?.userId ?? "null"}`)
    });

    expect(result).toEqual({ session, profile: null, pendingGuestCount: 0 });
    expect(events).toEqual([
      "loadStoredSession",
      "onSession:user-1",
      "configureAccessToken:access-1",
      "loadProfile",
      "onProfile:null"
    ]);
  });

  it("persists login before exposing the session and discovers guest migration work after profile", async () => {
    const events: string[] = [];
    const result = await loginSession(createServices(events), "google", {
      onSession: (value) => events.push(`onSession:${value.userId}`),
      onProfile: (value) => events.push(`onProfile:${value?.userId ?? "null"}`)
    });

    expect(result.pendingGuestCount).toBe(2);
    expect(events).toEqual([
      "loginWithNativeProvider:google",
      "configureAccessToken:access-1",
      "saveStoredSession:user-1",
      "onSession:user-1",
      "loadProfile",
      "onProfile:user-1",
      "loadPendingGuestCount"
    ]);
  });

  it("cleans up logout locally even when the remote logout fails", async () => {
    const events: string[] = [];
    const services = createServices(events, {
      logoutRemote: async () => { events.push("logoutRemote"); throw new Error("offline"); }
    });

    await logoutSession(services, session.provider, {
      onSessionCleared: () => events.push("onSessionCleared"),
      onRemainingStateCleared: () => events.push("onRemainingStateCleared")
    });

    expect(events).toEqual([
      "logoutRemote",
      "logoutFromNativeProvider:GOOGLE",
      "onSessionCleared",
      "configureAccessToken:null",
      "onRemainingStateCleared",
      "clearStoredSession"
    ]);
  });

  it("clears account content and credentials despite best-effort native and stored-session cleanup", async () => {
    const events: string[] = [];
    const services = createServices(events, {
      logoutFromNativeProvider: async (provider) => { events.push(`logoutFromNativeProvider:${provider}`); throw new Error("native failure"); },
      clearStoredSession: async () => { events.push("clearStoredSession"); throw new Error("storage failure"); }
    });

    await deleteSession(services, session);

    expect(events).toEqual([
      "deleteRemoteAccount",
      "logoutFromNativeProvider:GOOGLE",
      "clearUserContent:user-1",
      "clearStoredSession",
      "configureAccessToken:null"
    ]);
  });
});
