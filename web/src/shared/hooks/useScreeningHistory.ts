"use client";

import { useQuery } from "@tanstack/react-query";
import { useBridgeBootstrap } from "@/shared/hooks/useBridgeBootstrap";
import { getScreeningHistoryContent } from "@/shared/lib/content-store";

export function useScreeningHistory() {
  const bootstrap = useBridgeBootstrap();

  return useQuery({
    queryKey: ["screening-history", bootstrap.mode],
    queryFn: () => getScreeningHistoryContent(bootstrap.mode),
    enabled: bootstrap.ready
  });
}
