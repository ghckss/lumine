"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthSession } from "@/shared/lib/auth-session";
import { saveJournalEntryContent } from "@/shared/lib/content-store";
import { queryKeys } from "@/shared/lib/query-keys";

export function useSaveJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { date: string; emotions: string[]; body: string }) =>
      saveJournalEntryContent(payload),
    onSuccess: (entry) => {
      const authScope = getAuthSession().authScope;
      queryClient.setQueryData(
        queryKeys.journalEntry.detail({ date: entry.date, authScope }),
        entry
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.journalHistory.root });
    }
  });
}
