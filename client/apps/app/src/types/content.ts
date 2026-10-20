import {
  emotionColors as sharedEmotionColors,
  emotions as sharedEmotions,
  fallbackQuestionnaire,
  getEmotionColor,
  type ScreeningResult as SharedScreeningResult,
} from "@lumine/domain";

export type PageName =
  | "home"
  | "check-start"
  | "check-question"
  | "check-result"
  | "safety-result"
  | "diary"
  | "records"
  | "record-detail"
  | "mind-report"
  | "safety-help"
  | "menu"
  | "data-management"
  | "terms"
  | "privacy";

export type AppRoute = { key: string; page: PageName; params?: Record<string, unknown> };

export type JournalRecord = {
  id: string;
  date: string;
  emotions: string[];
  body: string;
  comfortMessage: string;
  createdAt: string;
  version: number;
  syncStatus: "synced" | "local" | "pending" | "failed" | "conflict";
  syncMessage?: string;
};

export type ScreeningResult = SharedScreeningResult & {
  id: string;
  completedDate: string;
};

export type {
  Emotion,
  ScreeningQuestion,
  ScreeningQuestionOption,
  ScreeningQuestionnaire,
} from "@lumine/domain";
export const emotions: string[] = [...sharedEmotions];
export const emotionColors: Record<string, string> = sharedEmotionColors;
export { getEmotionColor };

export { fallbackQuestionnaire };
