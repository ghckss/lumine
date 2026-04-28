"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import { queryKeys } from "@/shared/query-keys";

export function useSupportResources() {
  return useQuery({
    queryKey: queryKeys.supportResources,
    queryFn: () => api.support.getResources().then((response) => response.data)
  });
}
