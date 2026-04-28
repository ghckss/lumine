"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import { queryKeys } from "@/shared/query-keys";

export function useJournalEntries(limit = 10) {
  return useQuery({
    queryKey: queryKeys.journalHistory(limit),
    queryFn: () => api.journal.getEntries(limit).then((response) => response.data)
  });
}
