import { getAuthSession, resetAuthSessionCache } from "@/shared/lib/auth-session";

export type ApiResponse<T> = {
  data: T;
};

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

const CONFIGURED_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const LOCAL_API_PORT = "8080";

function isLoopbackHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function getHostname(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
}

function getRuntimeLocalApiBaseUrl() {
  const url = new URL(window.location.href);
  url.port = LOCAL_API_PORT;
  url.pathname = "";
  url.search = "";
  url.hash = "";

  return url.origin;
}

function getApiBaseUrl() {
  if (typeof window === "undefined") {
    return CONFIGURED_API_BASE_URL || "http://localhost:8080";
  }

  if (!CONFIGURED_API_BASE_URL) {
    return getRuntimeLocalApiBaseUrl();
  }

  const configuredHostname = getHostname(CONFIGURED_API_BASE_URL);
  if (isLoopbackHost(configuredHostname) && configuredHostname !== window.location.hostname) {
    return getRuntimeLocalApiBaseUrl();
  }

  return CONFIGURED_API_BASE_URL;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = getAuthSession().accessToken;
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    if (response.status === 401) {
      resetAuthSessionCache({ clearCookie: true });
    }

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
