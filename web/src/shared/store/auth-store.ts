"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthProvider } from "@/shared/types/domain";

type AuthState = {
  isAuthenticated: boolean;
  provider: AuthProvider | null;
  displayName: string | null;
  login: (provider: AuthProvider, displayName?: string) => void;
  signup: (provider: AuthProvider, displayName?: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      provider: null,
      displayName: null,
      login: (provider, displayName) =>
        set({
          isAuthenticated: true,
          provider,
          displayName: displayName ?? defaultDisplayName(provider)
        }),
      signup: (provider, displayName) =>
        set({
          isAuthenticated: true,
          provider,
          displayName: displayName ?? defaultDisplayName(provider)
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          provider: null,
          displayName: null
        })
    }),
    {
      name: "melancholy-auth"
    }
  )
);

function defaultDisplayName(provider: AuthProvider) {
  return provider === "kakao" ? "카카오 사용자" : "구글 사용자";
}
