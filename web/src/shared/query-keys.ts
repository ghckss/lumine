export const queryKeys = {
  screeningQuestionnaire: ["screening", "questionnaire"] as const,
  screeningHistory: ["screening", "history"] as const,
  journalEntries: (date: string) => ["journal", "entries", date] as const,
  journalHistory: (limit: number) => ["journal", "history", limit] as const,
  supportResources: ["support", "resources"] as const
};
