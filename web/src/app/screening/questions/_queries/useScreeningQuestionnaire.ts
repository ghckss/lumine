"use client";

import { useQuery } from "@tanstack/react-query";
import type { ScreeningQuestionnaire } from "@/shared/lib/api";
import { api } from "@/shared/lib/api";
import { queryKeys } from "@/shared/lib/query-keys";

export function useScreeningQuestionnaire(initialData?: ScreeningQuestionnaire | null) {
  return useQuery({
    queryKey: queryKeys.screeningQuestionnaire.detail(),
    queryFn: api.getScreeningQuestionnaire,
    initialData: initialData ?? undefined,
    staleTime: initialData ? 60 * 60 * 1000 : 0
  });
}
