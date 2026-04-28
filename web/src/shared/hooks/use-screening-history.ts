"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";

export function useScreeningHistory() {
  return useQuery({
    queryKey: ["screening-history"],
    queryFn: api.getScreeningHistory
  });
}
