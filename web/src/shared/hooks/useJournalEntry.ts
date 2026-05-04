"use client";

import { useQuery } from "@tanstack/react-query";
import { useBridgeBootstrap } from "@/shared/hooks/useBridgeBootstrap";
import { getJournalEntryContent } from "@/shared/lib/content-store";

type UseJournalEntryOptions = {
  enabled?: boolean;
  refetchOnMount?: boolean | "always";
};

export function useJournalEntry(date: string, options?: UseJournalEntryOptions) {
  const bootstrap = useBridgeBootstrap();

  return useQuery({
    queryKey: ["journal-entry", date, bootstrap.mode],
    queryFn: () => getJournalEntryContent(date, bootstrap.mode),
    enabled: bootstrap.ready && Boolean(date) && (options?.enabled ?? true),
    staleTime: 0,
    refetchOnMount: options?.refetchOnMount ?? true
  });
}
