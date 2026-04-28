"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";

export function useJournalHistory(limit = 10) {
  return useQuery({
    queryKey: ["journal-history", limit],
    queryFn: () => api.getJournalHistory(limit)
  });
}
