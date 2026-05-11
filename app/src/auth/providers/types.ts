export type NativeProviderName = "kakao" | "google";

export type NativeAuthPayload = {
  provider: NativeProviderName;
  providerUserId: string;
  accessToken: string;
  idToken?: string | null;
  displayName?: string | null;
};

export type NativeAuthProvider = {
  initialize?: () => Promise<void>;
  authorize: () => Promise<NativeAuthPayload>;
  logout?: () => Promise<void>;
};
