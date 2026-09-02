import { API_BASE_URL } from "../config/env";
import type { Gender, LoginSession, UserProfile } from "../types/session";
import type { JournalRecord, ScreeningQuestionnaire, ScreeningResult } from "../types/content";

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

export type ContentImportItem =
  | { id: string; type: "JOURNAL"; journal: JournalEntryPayload }
  | { id: string; type: "SCREENING"; screening: ScreeningPayload };

export type ContentImportResult = {
  items: Array<{
    id: string;
    status: "IMPORTED" | "ALREADY_IMPORTED" | "CONFLICT" | "FAILED";
    message?: string | null;
  }>;
};

export type UserDataExport = {
  schemaVersion: string;
  exportedAt: string;
  profile: UserProfile;
  journals: ServerJournalEntry[];
  screenings: Array<{
    completedDate: string;
    answers: Record<string, string>;
    publicSummary: string;
    publicComfortMessage: string;
    recommendedActions: string[];
    recommendedRescreenAt: string;
    requiresSafetyPrompt: boolean;
  }>;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}

let accessToken: string | null = null;

export function configureApiAccessToken(token: string | null) {
  accessToken = token;
}

export const api = {
  login(
    provider: "kakao" | "google",
    payload?: {
      providerUserId?: string;
      accessToken?: string;
      idToken?: string;
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
  exportMyData() {
    return request<UserDataExport>("/api/users/me/export");
  },
  deleteMe() {
    return request<{ success: boolean }>("/api/users/me", { method: "DELETE" });
  },
  saveJournalEntry(payload: JournalEntryPayload) {
    return request<ServerJournalEntry>("/api/journal/entries", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  submitScreening(payload: ScreeningPayload) {
    return request<Omit<ScreeningResult, "id" | "completedDate">>("/api/screening/submissions", {
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
  },
  getJournalHistory(limit = 30) {
    return request<ServerJournalEntry[]>(`/api/journal/entries/history?limit=${limit}`);
  },
  getScreeningQuestionnaire() {
    return request<ScreeningQuestionnaire>("/api/screening/questionnaire");
  },
  getScreeningHistory() {
    return request<Array<{ completedDate: string; publicSummary: string; recommendedRescreenAt: string; requiresSafetyPrompt: boolean }>>("/api/screening/history");
  },
  importGuestContent(items: ContentImportItem[]) {
    return request<ContentImportResult>("/api/users/me/content-import", {
      method: "POST",
      body: JSON.stringify({ items })
    });
  },
  getSupportResources() {
    return request<Array<{ code: string; title: string; phone: string; description: string }>>("/api/support/resources");
  }
};

export type ServerJournalEntry = {
  date: string;
  emotions: Array<{ id: string; label: string }>;
  body: string;
  comfortMessage: string;
  createdAt: string;
};

export function toJournalRecord(entry: ServerJournalEntry): JournalRecord {
  return {
    id: `journal:${entry.date}`,
    date: entry.date,
    emotions: entry.emotions.map((emotion) => emotion.label),
    body: entry.body,
    comfortMessage: entry.comfortMessage,
    createdAt: entry.createdAt
  };
}
