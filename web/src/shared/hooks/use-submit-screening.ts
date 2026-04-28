"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";

export function useSubmitScreening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.submitScreening,
    onSuccess: (result) => {
      queryClient.setQueryData(["screening-latest"], result);
      queryClient.invalidateQueries({ queryKey: ["screening-history"] });
    }
  });
}
