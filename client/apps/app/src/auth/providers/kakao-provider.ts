import { nativeAuthConfig, shouldUseMockSocialLogin } from "../../config/auth";
import type { NativeAuthPayload, NativeAuthProvider } from "./types";

export class KakaoNativeAuthProvider implements NativeAuthProvider {
  async initialize(): Promise<void> {
    // Kakao SDK bootstrapping is handled by native app configuration.
  }

  async authorize(): Promise<NativeAuthPayload> {
    try {
      const kakaoModule = require("@react-native-seoul/kakao-login");

      if (typeof kakaoModule?.login !== "function") {
        throw new Error("Kakao Login SDK를 불러오지 못했습니다.");
      }

      const token = await kakaoModule.login();
      const profile = typeof kakaoModule?.getProfile === "function" ? await kakaoModule.getProfile() : null;

      if (!profile?.id) {
        throw new Error("카카오 사용자 프로필을 확인하지 못했습니다.");
      }

      return {
        provider: "kakao",
        providerUserId: String(profile.id),
        accessToken: token.accessToken ?? "kakao-native-access-token",
        displayName: profile.nickname ?? profile.name ?? null
      };
    } catch {
      if (!shouldUseMockSocialLogin() || nativeAuthConfig.kakaoNativeAppKey) {
        throw new Error("카카오 로그인에 실패했습니다.");
      }
    }

    return {
      provider: "kakao",
      providerUserId: "mock-kakao-native-user",
      accessToken: "mock-kakao-native-access-token",
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
      if (!shouldUseMockSocialLogin()) {
        throw new Error("카카오 로그아웃에 실패했습니다.");
      }
    }
  }
}
