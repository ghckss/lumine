"use client";

import { useQuery } from "@tanstack/react-query";
import { useBridgeBootstrap } from "@/shared/hooks/use-bridge-bootstrap";
import { getScreeningLatestContent } from "@/shared/lib/content-store";

type UseScreeningLatestOptions = {
  refetchOnMount?: boolean | "always";
};

export function useScreeningLatest(options?: UseScreeningLatestOptions) {
  const bootstrap = useBridgeBootstrap();

  return useQuery({
    queryKey: ["screening-latest", bootstrap.mode],
    queryFn: () => getScreeningLatestContent(bootstrap.mode),
    enabled: bootstrap.ready,
    staleTime: 0,
    refetchOnMount: options?.refetchOnMount ?? true
  });
}
