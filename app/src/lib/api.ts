import { API_BASE_URL } from "../config/env";
import type { Gender, LoginSession, UserProfile } from "../types/session";

type ApiEnvelope<T> = {
  data: T;
};


export type JournalEntryPayload = {
  date: string;
  emotions: string[];
  body: string;
};

export type ScreeningPayload = {
  answers: Record<string, string>;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}

export const api = {
  login(
    provider: "kakao" | "google",
    payload?: {
      providerUserId?: string;
      accessToken?: string;
      refreshToken?: string;
      displayName?: string;
    }
  ) {
    return request<LoginSession>(`/api/auth/login/${provider}`, {
      method: "POST",
      body: JSON.stringify(payload ?? {})
    });
  },
  logout() {
    return request<{ success: boolean }>("/api/auth/logout", {
      method: "POST"
    });
  },
  getMe() {
    return request<UserProfile>("/api/users/me");
  },
  saveJournalEntry(payload: JournalEntryPayload) {
    return request("/api/journal/entries", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  submitScreening(payload: ScreeningPayload) {
    return request("/api/screening/submissions", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  upsertProfile(payload: {
    provider: LoginSession["provider"];
    displayName: string;
    gender: Gender;
    birthDate: string;
    agreedToTerms: boolean;
  }) {
    return request<UserProfile>("/api/users/profile", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};
