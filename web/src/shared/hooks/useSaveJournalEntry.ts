"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBridgeBootstrap } from "@/shared/hooks/useBridgeBootstrap";
import { saveJournalEntryContent } from "@/shared/lib/content-store";

export function useSaveJournalEntry() {
  const queryClient = useQueryClient();
  const bootstrap = useBridgeBootstrap();

  return useMutation({
    mutationFn: (payload: { date: string; emotions: string[]; body: string }) =>
      saveJournalEntryContent(payload, bootstrap.mode),
    onSuccess: (entry) => {
      queryClient.setQueryData(["journal-entry", entry.date, bootstrap.mode], entry);
      queryClient.invalidateQueries({ queryKey: ["journal-history"] });
    }
  });
}
