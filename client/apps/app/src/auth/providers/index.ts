import { GoogleNativeAuthProvider } from "./google-provider";
import { KakaoNativeAuthProvider } from "./kakao-provider";
import type { NativeAuthProvider, NativeProviderName } from "./types";

const providers: Record<NativeProviderName, NativeAuthProvider> = {
  kakao: new KakaoNativeAuthProvider(),
  google: new GoogleNativeAuthProvider()
};

export function getNativeAuthProvider(provider: NativeProviderName) {
  return providers[provider];
}

export async function initializeNativeAuthProviders() {
  await Promise.all(
    Object.values(providers).map(async (provider) => {
      await provider.initialize?.();
    })
  );
}
