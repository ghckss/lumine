import type { NativeAuthPayload, NativeAuthProvider } from "./types";

export class KakaoNativeAuthProvider implements NativeAuthProvider {
  async initialize(): Promise<void> {
    // Kakao SDK bootstrapping is handled by native app configuration.
  }

  async authorize(): Promise<NativeAuthPayload> {
    try {
      const kakaoModule = require("@react-native-seoul/kakao-login");

      if (typeof kakaoModule?.login === "function") {
        const result = await kakaoModule.login();

        return {
          provider: "kakao",
          providerUserId: String(result.id ?? "kakao-native-user"),
          accessToken: result.accessToken ?? "kakao-native-access-token",
          refreshToken: result.refreshToken ?? null,
          displayName: result.nickname ?? null
        };
      }
    } catch {
      // Fall through to shell mock when the SDK is not installed yet.
    }

    return {
      provider: "kakao",
      providerUserId: "mock-kakao-native-user",
      accessToken: "mock-kakao-native-access-token",
      refreshToken: "mock-kakao-native-refresh-token",
      displayName: "하린"
    };
  }

  async logout(): Promise<void> {
    try {
      const kakaoModule = require("@react-native-seoul/kakao-login");
      if (typeof kakaoModule?.logout === "function") {
        await kakaoModule.logout();
      }
    } catch {
      // Ignore provider logout errors in shell mode.
    }
  }
}
