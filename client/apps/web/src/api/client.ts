import { API_BASE_URL } from "@/config/env";
import { ApiError, isRetryableApiError } from "@lumine/api-contracts";
import type {
  ContentImportItem,
  ContentImportResult,
  Gender,
  JournalEntryPayload,
  LoginSession,
  ScreeningHistoryItem,
  ScreeningPayload,
  ScreeningQuestionnaire,
  ScreeningResult,
  ServerJournalEntry,
  SupportResource,
  UserDataExport,
  UserProfile,
} from "@/api/types";

type ApiEnvelope<T> = { data: T };

let accessToken: string | null = null;

export class ApiConfigurationError extends Error {
  constructor() {
    super("NEXT_PUBLIC_LUMINE_API_BASE_URL is not configured.");
    this.name = "ApiConfigurationError";
  }
}

export function configureApiAccessToken(token: string | null) {
  accessToken = token;
}

export { ApiError, isRetryableApiError };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) throw new ApiConfigurationError();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text().catch(() => undefined));
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
      idToken?: string;
      displayName?: string;
    },
  ) {
    return request<LoginSession>(`/api/auth/login/${provider}`, {
      method: "POST",
      body: JSON.stringify(payload ?? {}),
    });
  },
  logout() {
    return request<{ success: boolean }>("/api/auth/logout", { method: "POST" });
  },
  getMe() {
    return request<UserProfile>("/api/users/me");
  },
  exportMyData() {
    return request<UserDataExport>("/api/users/me/export");
  },
  deleteMe() {
    return request<{ success: boolean }>("/api/users/me", { method: "DELETE" });
  },
  saveJournalEntry(payload: JournalEntryPayload) {
    return request<ServerJournalEntry>("/api/journal/entries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  deleteJournalEntry(date: string, expectedVersion: number) {
    const query = new URLSearchParams({ date, expectedVersion: String(expectedVersion) });
    return request<{ deleted: boolean }>(`/api/journal/entries?${query}`, {
      method: "DELETE",
    });
  },
  submitScreening(payload: ScreeningPayload) {
    return request<ScreeningResult>("/api/screening/submissions", {
      method: "POST",
      body: JSON.stringify(payload),
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
      body: JSON.stringify(payload),
    });
  },
  getJournalHistory(limit = 30) {
    return request<ServerJournalEntry[]>(`/api/journal/entries/history?limit=${limit}`);
  },
  getJournalRange(startDate: string, endDate: string) {
    const query = new URLSearchParams({ startDate, endDate });
    return request<ServerJournalEntry[]>(`/api/journal/entries/range?${query}`);
  },
  getScreeningQuestionnaire() {
    return request<ScreeningQuestionnaire>("/api/screening/questionnaire");
  },
  getScreeningHistory() {
    return request<ScreeningHistoryItem[]>("/api/screening/history");
  },
  importGuestContent(items: ContentImportItem[]) {
    return request<ContentImportResult>("/api/users/me/content-import", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
  },
  getSupportResources() {
    return request<SupportResource[]>("/api/support/resources");
  },
};
