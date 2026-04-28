"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";

export function useSaveJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.saveJournalEntry,
    onSuccess: (entry) => {
      queryClient.setQueryData(["journal-entry", entry.date], entry);
      queryClient.invalidateQueries({ queryKey: ["journal-history"] });
    }
  });
}
