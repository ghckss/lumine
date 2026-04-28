"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";

export function useSubmitScreening() {
  return useMutation({
    mutationFn: api.screening.submit,
    mutationKey: ["screening", "submit"]
  });
}
