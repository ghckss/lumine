"use client";

import { create } from "zustand";

type JournalState = {
  selectedEmotions: string[];
  body: string;
  setSelectedEmotions: (selectedEmotions: string[]) => void;
  setBody: (body: string) => void;
};

export const useJournalStore = create<JournalState>((set) => ({
  selectedEmotions: [],
  body: "",
  setSelectedEmotions: (selectedEmotions) => set({ selectedEmotions }),
  setBody: (body) => set({ body })
}));
