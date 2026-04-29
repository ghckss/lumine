import type { NativeAuthPayload, NativeAuthProvider } from "./types";

export class GoogleNativeAuthProvider implements NativeAuthProvider {
  async initialize(): Promise<void> {
    try {
      const googleModule = require("@react-native-google-signin/google-signin");
      const googleWebClientId =
        typeof process !== "undefined" && process.env ? process.env.GOOGLE_WEB_CLIENT_ID : undefined;

      if (typeof googleModule?.GoogleSignin?.configure === "function") {
        googleModule.GoogleSignin.configure({
          ...(googleWebClientId ? { webClientId: googleWebClientId } : {}),
          offlineAccess: true
        });
      }
    } catch {
      // Keep shell initialization optional until native projects are added.
    }
  }

  async authorize(): Promise<NativeAuthPayload> {
    try {
      const googleModule = require("@react-native-google-signin/google-signin");

      if (typeof googleModule?.GoogleSignin?.signIn === "function") {
        const result = await googleModule.GoogleSignin.signIn();
        const tokens = await googleModule.GoogleSignin.getTokens();

        return {
          provider: "google",
          providerUserId: String(result.user?.id ?? "google-native-user"),
          accessToken: tokens.accessToken ?? "google-native-access-token",
          refreshToken: null,
          displayName: result.user?.name ?? null
        };
      }
    } catch {
      // Fall through to shell mock when the SDK is not installed yet.
    }

    return {
      provider: "google",
      providerUserId: "mock-google-native-user",
      accessToken: "mock-google-native-access-token",
      refreshToken: null,
      displayName: "서윤"
    };
  }

  async logout(): Promise<void> {
    try {
      const googleModule = require("@react-native-google-signin/google-signin");
      if (typeof googleModule?.GoogleSignin?.signOut === "function") {
        await googleModule.GoogleSignin.signOut();
      }
    } catch {
      // Ignore provider logout errors in shell mode.
    }
  }
}
