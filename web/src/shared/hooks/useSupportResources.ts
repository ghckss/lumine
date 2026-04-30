"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";

export function useSupportResources() {
  return useQuery({
    queryKey: ["support-resources"],
    queryFn: api.getSupportResources
  });
}
