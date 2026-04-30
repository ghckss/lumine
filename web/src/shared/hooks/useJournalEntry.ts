"use client";

import { useQuery } from "@tanstack/react-query";
import { useBridgeBootstrap } from "@/shared/hooks/useBridgeBootstrap";
import { getJournalEntryContent } from "@/shared/lib/content-store";

export function useJournalEntry(date: string) {
  const bootstrap = useBridgeBootstrap();

  return useQuery({
    queryKey: ["journal-entry", date, bootstrap.mode],
    queryFn: () => getJournalEntryContent(date, bootstrap.mode),
    enabled: bootstrap.ready
  });
}
