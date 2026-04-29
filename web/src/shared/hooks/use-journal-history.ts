"use client";

import { useQuery } from "@tanstack/react-query";
import { useBridgeBootstrap } from "@/shared/hooks/use-bridge-bootstrap";
import { getJournalHistoryContent } from "@/shared/lib/content-store";

export function useJournalHistory(limit = 10) {
  const bootstrap = useBridgeBootstrap();

  return useQuery({
    queryKey: ["journal-history", limit, bootstrap.mode],
    queryFn: () => getJournalHistoryContent(bootstrap.mode, limit),
    enabled: bootstrap.ready
  });
}
