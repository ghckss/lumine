import { decodeAuthFromToken, type AuthScope } from "@/shared/lib/jwt-auth";

export const AUTH_ACCESS_TOKEN_COOKIE = "lumine_access_token";

export type AuthSession = {
  authScope: AuthScope;
  permission: string | null;
  accessToken: string | null;
  userId: string | null;
  provider: string | null;
  displayName: string | null;
};

let cachedAuthSession: AuthSession | null = null;

export function getAuthSession(): AuthSession {
  if (cachedAuthSession) {
    return cachedAuthSession;
  }

  const accessToken = readAuthCookie();
  const decodedAuth = decodeAuthFromToken(accessToken);
  cachedAuthSession = {
    authScope: decodedAuth.scope,
    permission: decodedAuth.permission,
    accessToken: decodedAuth.permission ? accessToken : null,
    userId: decodedAuth.userId,
    provider: decodedAuth.provider,
    displayName: decodedAuth.displayName
  };

  return cachedAuthSession;
}

export function resetAuthSessionCache(options?: { clearCookie?: boolean }) {
  cachedAuthSession = null;

  if (options?.clearCookie) {
    clearAuthCookie();
  }
}

function readAuthCookie() {
  if (typeof document === "undefined") {
    return null;
  }

  const cookiePrefix = `${AUTH_ACCESS_TOKEN_COOKIE}=`;
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(cookiePrefix));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(cookiePrefix.length));
}

function clearAuthCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${AUTH_ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
