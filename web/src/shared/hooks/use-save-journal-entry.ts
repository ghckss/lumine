"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import { queryKeys } from "@/shared/query-keys";

export function useSaveJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.journal.saveEntry,
    mutationKey: ["journal", "save"],
    onSuccess: (response, variables) => {
      queryClient.setQueryData(queryKeys.journalEntries(variables.date), response.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.journalEntries(variables.date) });
    }
  });
}
