"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import { queryKeys } from "@/shared/query-keys";

export function useScreeningQuestionnaire() {
  return useQuery({
    queryKey: queryKeys.screeningQuestionnaire,
    queryFn: () => api.screening.getQuestionnaire().then((response) => response.data)
  });
}
