export type ApiResponse<T> = {
  data: T;
};

let authAccessToken: string | null = null;

export type JournalEmotion = {
  id: string;
  label: string;
};

export type JournalEntry = {
  date: string;
  emotions: JournalEmotion[];
  body: string;
  comfortMessage: string;
  createdAt: string;
};

export type ScreeningQuestionOption = {
  value: string;
  label: string;
  score?: number | null;
};

export type ScreeningQuestionItem = {
  id: string;
  kind: "single_choice" | "long_text" | string;
  title: string;
  description?: string | null;
  required: boolean;
  options: ScreeningQuestionOption[];
};

export type ScreeningQuestionSection = {
  id: string;
  title: string;
  items: ScreeningQuestionItem[];
};

export type ScreeningQuestionnaire = {
  version: string;
  title: string;
  subtitle: string;
  sections: ScreeningQuestionSection[];
};

export type ScreeningResult = {
  publicSummary: string;
  publicComfortMessage: string;
  recommendedActions: string[];
  recommendedRescreenAt: string;
  requiresSafetyPrompt: boolean;
};

export type ScreeningHistoryItem = {
  completedDate: string;
  publicSummary: string;
  recommendedRescreenAt: string;
  requiresSafetyPrompt: boolean;
};

export type SupportResource = {
  code: string;
  title: string;
  phone: string;
  description: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export function setApiAccessToken(token: string | null) {
  authAccessToken = token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(authAccessToken ? { Authorization: `Bearer ${authAccessToken}` } : {}),
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data;
}

export const api = {
  getJournalEntry(date: string) {
    return request<JournalEntry | null>(`/api/journal/entries?date=${date}`);
  },
  getJournalHistory(limit = 10) {
    return request<JournalEntry[]>(`/api/journal/entries/history?limit=${limit}`);
  },
  saveJournalEntry(payload: { date: string; emotions: string[]; body: string }) {
    return request<JournalEntry>("/api/journal/entries", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  getScreeningQuestionnaire() {
    return request<ScreeningQuestionnaire>("/api/screening/questionnaire");
  },
  submitScreening(payload: { answers: Record<string, string> }) {
    return request<ScreeningResult>("/api/screening/submissions", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  getLatestScreening() {
    return request<ScreeningResult | null>("/api/screening/latest");
  },
  getScreeningHistory() {
    return request<ScreeningHistoryItem[]>("/api/screening/history");
  },
  getSupportResources() {
    return request<SupportResource[]>("/api/support/resources");
  }
};
