"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";

export function useScreeningQuestionnaire() {
  return useQuery({
    queryKey: ["screening-questionnaire"],
    queryFn: api.getScreeningQuestionnaire
  });
}
