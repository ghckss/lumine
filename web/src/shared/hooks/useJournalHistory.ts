"use client";

import { useQuery } from "@tanstack/react-query";
import { useBridgeBootstrap } from "@/shared/hooks/useBridgeBootstrap";
import { getJournalHistoryContent } from "@/shared/lib/content-store";

type UseJournalHistoryOptions = {
  refetchOnMount?: boolean | "always";
};

export function useJournalHistory(limit = 10, options?: UseJournalHistoryOptions) {
  const bootstrap = useBridgeBootstrap();

  return useQuery({
    queryKey: ["journal-history", limit, bootstrap.mode],
    queryFn: () => getJournalHistoryContent(bootstrap.mode, limit),
    enabled: bootstrap.ready,
    staleTime: 0,
    refetchOnMount: options?.refetchOnMount ?? true
  });
}
