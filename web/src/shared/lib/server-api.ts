import "server-only";

import type {
  ApiResponse,
  JournalEntry,
  ScreeningHistoryItem,
  ScreeningQuestionnaire,
  ScreeningResult,
  SupportResource
} from "@/shared/lib/api";

type NextRequestInit = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

const API_BASE_URL = process.env.API_INTERNAL_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function serverRequest<T>(path: string, init?: NextRequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data;
}

export const serverApi = {
  getJournalEntry(date: string) {
    return serverRequest<JournalEntry | null>(`/api/journal/entries?date=${encodeURIComponent(date)}`, {
      cache: "no-store"
    });
  },
  getJournalHistory(limit = 10) {
    return serverRequest<JournalEntry[]>(`/api/journal/entries/history?limit=${limit}`, {
      cache: "no-store"
    });
  },
  getScreeningQuestionnaire() {
    return serverRequest<ScreeningQuestionnaire>("/api/screening/questionnaire", {
      next: { revalidate: 60 * 60 * 24 }
    });
  },
  getLatestScreening() {
    return serverRequest<ScreeningResult | null>("/api/screening/latest", {
      cache: "no-store"
    });
  },
  getScreeningHistory() {
    return serverRequest<ScreeningHistoryItem[]>("/api/screening/history", {
      cache: "no-store"
    });
  },
  getSupportResources() {
    return serverRequest<SupportResource[]>("/api/support/resources", {
      next: { revalidate: 60 * 60 }
    });
  }
};
