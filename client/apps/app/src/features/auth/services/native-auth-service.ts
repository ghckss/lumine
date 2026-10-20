import { authApi } from "../api/auth-api";
import type { LoginSession } from "../model/session";
import { getNativeAuthProvider } from "../providers";
import type { NativeProviderName } from "../providers/types";

export async function loginWithNativeProvider(provider: NativeProviderName): Promise<LoginSession> {
  const nativeProvider = getNativeAuthProvider(provider);
  const nativeAuth = await nativeProvider.authorize();

  return authApi.login(provider, {
    providerUserId: nativeAuth.providerUserId,
    accessToken: nativeAuth.accessToken,
    idToken: nativeAuth.idToken ?? undefined,
    displayName: nativeAuth.displayName ?? undefined
  });
}

export async function logoutFromNativeProvider(provider: LoginSession["provider"] | undefined | null) {
  if (!provider) return;

  const nativeProvider = getNativeAuthProvider(provider.toLowerCase() as NativeProviderName);
  await nativeProvider.logout?.();
}
