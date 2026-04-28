"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";

export function useScreeningResult() {
  return useQuery({
    queryKey: ["screening", "latest-result"],
    queryFn: () => api.screening.getLatestResult().then((response) => response.data)
  });
}
