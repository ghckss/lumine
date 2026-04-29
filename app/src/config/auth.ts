import { Platform } from "react-native";

function normalizeConfigValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("YOUR_") || trimmed.startsWith("REPLACE_")) {
    return null;
  }

  return trimmed;
}

export const nativeAuthConfig = {
  enableMockSocialLogin: true,
  kakaoNativeAppKey: normalizeConfigValue("YOUR_KAKAO_NATIVE_APP_KEY"),
  googleWebClientId: normalizeConfigValue("YOUR_GOOGLE_WEB_CLIENT_ID"),
  googleIosClientId: normalizeConfigValue("YOUR_GOOGLE_IOS_CLIENT_ID"),
  googleServicePlistPath: Platform.OS === "ios" ? "GoogleService-Info" : null
} as const;

export function shouldUseMockSocialLogin() {
  return nativeAuthConfig.enableMockSocialLogin;
}
