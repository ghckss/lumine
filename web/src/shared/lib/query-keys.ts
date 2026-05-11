import type { AuthScope } from "@/shared/lib/jwt-auth";

export const queryKeys = {
  journalEntry: {
    root: ["journal-entry"],
    detail: (params: { date: string; authScope: AuthScope }) => ["journal-entry", params] as const
  },
  journalHistory: {
    root: ["journal-history"],
    detail: (params: { limit: number; authScope: AuthScope }) => ["journal-history", params] as const
  },
  screeningQuestionnaire: {
    root: ["screening-questionnaire"],
    detail: () => ["screening-questionnaire"] as const
  },
  screeningLatest: {
    root: ["screening-latest"],
    detail: (params: { authScope: AuthScope }) => ["screening-latest", params] as const
  },
  screeningHistory: {
    root: ["screening-history"],
    detail: (params: { authScope: AuthScope }) => ["screening-history", params] as const
  },
  supportResources: {
    root: ["support-resources"],
    detail: () => ["support-resources"] as const
  }
} as const;
