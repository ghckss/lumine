import { accountApi } from "../../features/account/api/account-api";
import { authApi } from "../../features/auth/api/auth-api";
import type { SessionServices } from "../../features/auth/model/session-lifecycle";
import { loginWithNativeProvider, logoutFromNativeProvider } from "../../features/auth/services/native-auth-service";
import { clearSession, loadSession, saveSession } from "../../features/auth/storage/session-storage";
import { syncGuestContentToServer } from "../../lib/content-sync";
import { configureApiAccessToken } from "../../shared/api/http-client";
import { contentCacheKeys, removeDeviceCache } from "../../shared/storage/device-cache";
import { loadPendingSyncQueue } from "../../storage/pending-sync";

export const sessionServices: SessionServices = {
  loadStoredSession: loadSession,
  saveStoredSession: saveSession,
  clearStoredSession: clearSession,
  configureAccessToken: configureApiAccessToken,
  loginWithNativeProvider,
  logoutFromNativeProvider,
  logoutRemote: authApi.logout,
  loadProfile: accountApi.getMe,
  saveProfile: accountApi.upsertProfile,
  deleteRemoteAccount: accountApi.deleteMe,
  clearUserContent: async (userId) => {
    await Promise.all(contentCacheKeys(userId).map((key) => removeDeviceCache(key).catch(() => undefined)));
  },
  loadPendingGuestCount: async () => (await loadPendingSyncQueue()).length,
  migrateGuestContent: syncGuestContentToServer
};
