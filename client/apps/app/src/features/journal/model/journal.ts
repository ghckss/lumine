import {
  emotionColors as sharedEmotionColors,
  emotions as sharedEmotions,
  getEmotionColor
} from "@lumine/domain";

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

export type { Emotion } from "@lumine/domain";
export const emotions: string[] = [...sharedEmotions];
export const emotionColors: Record<string, string> = sharedEmotionColors;
export { getEmotionColor };
