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
  kakaoNativeAppKey: normalizeConfigValue("c32eccf4981c6f1509d9d675e1b50ceb"),
  googleWebClientId: normalizeConfigValue("56571786840-vqvqk71u9ut1tb5j0fbv5pv05pcia3v5.apps.googleusercontent.com"),
  googleIosClientId: normalizeConfigValue("56571786840-dahtgvfrnbn81plpul139grh2jf7m2gk.apps.googleusercontent.com"),
  googleServicePlistPath: Platform.OS === "ios" ? "GoogleService-Info" : null
} as const;

export function shouldUseMockSocialLogin() {
  return nativeAuthConfig.enableMockSocialLogin;
}
