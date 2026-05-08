import { Platform } from "react-native";
import { nativeAuthConfig, shouldUseMockSocialLogin } from "../../config/auth";
import type { NativeAuthPayload, NativeAuthProvider } from "./types";

function getGoogleSigninOptions() {
  return {
    ...(nativeAuthConfig.googleWebClientId ? { webClientId: nativeAuthConfig.googleWebClientId } : {}),
    ...(Platform.OS === "ios" && nativeAuthConfig.googleIosClientId
      ? { iosClientId: nativeAuthConfig.googleIosClientId }
      : {}),
    ...(Platform.OS === "ios" && nativeAuthConfig.googleServicePlistPath
      ? { googleServicePlistPath: nativeAuthConfig.googleServicePlistPath }
      : {}),
    offlineAccess: Boolean(nativeAuthConfig.googleWebClientId)
  };
}

export class GoogleNativeAuthProvider implements NativeAuthProvider {
  async initialize(): Promise<void> {
    try {
      const googleModule = require("@react-native-google-signin/google-signin");

      if (typeof googleModule?.GoogleSignin?.configure === "function") {
        googleModule.GoogleSignin.configure(getGoogleSigninOptions());
      }
    } catch {
      if (
        !shouldUseMockSocialLogin() ||
        nativeAuthConfig.googleWebClientId ||
        nativeAuthConfig.googleIosClientId
      ) {
        throw new Error("Google Sign-In 초기화에 실패했습니다.");
      }
    }
  }

  async authorize(): Promise<NativeAuthPayload> {
    try {
      const googleModule = require("@react-native-google-signin/google-signin");

      if (typeof googleModule?.GoogleSignin?.configure !== "function" || typeof googleModule?.GoogleSignin?.signIn !== "function") {
        throw new Error("Google Sign-In SDK를 불러오지 못했습니다.");
      }

      googleModule.GoogleSignin.configure(getGoogleSigninOptions());

      if (Platform.OS === "android" && typeof googleModule.GoogleSignin.hasPlayServices === "function") {
        await googleModule.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const result = await googleModule.GoogleSignin.signIn();
      if (result?.type !== "success" || !result.data?.user?.id) {
        throw new Error("Google 로그인 결과를 확인하지 못했습니다.");
      }

      const tokens =
        typeof googleModule.GoogleSignin.getTokens === "function"
          ? await googleModule.GoogleSignin.getTokens()
          : null;

      return {
        provider: "google",
        providerUserId: String(result.data.user.id),
        accessToken: tokens?.accessToken ?? result.data.idToken ?? "google-native-access-token",
        idToken: result.data.idToken ?? null,
        refreshToken: null,
        displayName: result.data.user.name ?? null
      };
    } catch {
      if (
        !shouldUseMockSocialLogin() ||
        nativeAuthConfig.googleWebClientId ||
        nativeAuthConfig.googleIosClientId
      ) {
        throw new Error("Google 로그인에 실패했습니다.");
      }
    }

    return {
      provider: "google",
      providerUserId: "mock-google-native-user",
      accessToken: "mock-google-native-access-token",
      idToken: "mock-google-native-id-token",
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
      if (!shouldUseMockSocialLogin()) {
        throw new Error("Google 로그아웃에 실패했습니다.");
      }
    }
  }
}
