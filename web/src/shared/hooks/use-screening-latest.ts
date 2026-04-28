"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";

export function useScreeningLatest() {
  return useQuery({
    queryKey: ["screening-latest"],
    queryFn: api.getLatestScreening
  });
}
