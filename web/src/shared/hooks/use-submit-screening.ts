"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBridgeBootstrap } from "@/shared/hooks/use-bridge-bootstrap";
import type { ScreeningQuestionnaire } from "@/shared/lib/api";
import { submitScreeningContent } from "@/shared/lib/content-store";

export function useSubmitScreening() {
  const queryClient = useQueryClient();
  const bootstrap = useBridgeBootstrap();

  return useMutation({
    mutationFn: async (payload: { answers: Record<string, string> }) => {
      const questionnaire = queryClient.getQueryData<ScreeningQuestionnaire>(["screening-questionnaire"]);
      if (!questionnaire) {
        throw new Error("Questionnaire not loaded");
      }
      return submitScreeningContent(questionnaire, payload, bootstrap.mode);
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["screening-latest", bootstrap.mode], result);
      queryClient.invalidateQueries({ queryKey: ["screening-history"] });
    }
  });
}
