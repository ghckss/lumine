"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthSession } from "@/shared/lib/auth-session";
import type { ScreeningQuestionnaire } from "@/shared/lib/api";
import { submitScreeningContent } from "@/shared/lib/content-store";
import { queryKeys } from "@/shared/lib/query-keys";

export function useSubmitScreening(initialQuestionnaire?: ScreeningQuestionnaire | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { answers: Record<string, string> }) => {
      const questionnaire = initialQuestionnaire ?? queryClient.getQueryData<ScreeningQuestionnaire>(
        queryKeys.screeningQuestionnaire.detail()
      );
      if (!questionnaire) {
        throw new Error("Questionnaire not loaded");
      }
      return submitScreeningContent(questionnaire, payload);
    },
    onSuccess: (result) => {
      const authScope = getAuthSession().authScope;
      queryClient.setQueryData(
        queryKeys.screeningLatest.detail({ authScope }),
        result
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.screeningHistory.root });
    }
  });
}
