"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ScreeningResult } from "@/shared/types/domain";

type ScreeningState = {
  answers: Record<string, string>;
  result: ScreeningResult | null;
  lastCompletedDate: string | null;
  setAnswer: (questionId: string, value: string) => void;
  setResult: (result: ScreeningResult, completedDate?: string) => void;
  reset: () => void;
};

export const useScreeningStore = create<ScreeningState>()(
  persist(
    (set) => ({
      answers: {},
      result: null,
      lastCompletedDate: null,
      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: value
          }
        })),
      setResult: (result, completedDate) =>
        set({
          result,
          lastCompletedDate: completedDate ?? null
        }),
      reset: () => set({ answers: {}, result: null, lastCompletedDate: null })
    }),
    {
      name: "melancholy-screening"
    }
  )
);
