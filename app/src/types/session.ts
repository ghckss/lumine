export type AuthProvider = "KAKAO" | "GOOGLE";
export type Gender = "FEMALE" | "MALE" | "OTHER";

export type LoginSession = {
  userId: string;
  provider: AuthProvider;
  displayName: string;
  accessToken: string;
};

export type UserProfile = {
  userId: string;
  provider: AuthProvider;
  displayName: string;
  gender: Gender | null;
  birthDate: string | null;
  agreedToTerms: boolean;
  signedUpAt: string | null;
};
