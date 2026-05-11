export type AuthScope = "guest" | "user";

export type UserTokenClaims = {
  sub?: string;
  provider?: string;
  displayName?: string;
  permission?: string;
  exp?: number;
};

export type DecodedAuth = {
  scope: AuthScope;
  permission: string | null;
  userId: string | null;
  provider: string | null;
  displayName: string | null;
};

export function decodeAuthFromToken(token: string | null): DecodedAuth {
  if (!token) {
    return guestAuth();
  }

  const claims = decodeJwtPayload(token);
  if (!claims || !claims.permission || isExpired(claims.exp)) {
    return guestAuth();
  }

  return {
    scope: "user",
    permission: claims.permission,
    userId: claims.sub ?? null,
    provider: claims.provider ?? null,
    displayName: claims.displayName ?? null
  };
}

function decodeJwtPayload(token: string): UserTokenClaims | null {
  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const binary = globalThis.atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const claims = JSON.parse(decoded) as UserTokenClaims;

    return typeof claims === "object" && claims !== null ? claims : null;
  } catch {
    return null;
  }
}

function isExpired(exp?: number) {
  if (typeof exp !== "number") {
    return false;
  }

  return exp * 1000 <= Date.now();
}

function guestAuth(): DecodedAuth {
  return {
    scope: "guest",
    permission: null,
    userId: null,
    provider: null,
    displayName: null
  };
}
