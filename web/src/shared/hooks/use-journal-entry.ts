"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import { queryKeys } from "@/shared/query-keys";

export function useJournalEntry(date: string) {
  return useQuery({
    queryKey: queryKeys.journalEntries(date),
    queryFn: () => api.journal.getEntry(date).then((response) => response.data)
  });
}
