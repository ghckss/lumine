import {
  calculateStreak,
  createComfortMessage,
  emotionColors,
  emotionStats,
  emotions,
  koreanDate,
  lastDays,
  localIsoDate,
  screeningAnswerLabels,
  screeningQuestions,
  type Emotion,
} from "@lumine/domain";

export { emotionColors, emotions };
export type { Emotion };
export type Route = "home" | "journal" | "records" | "check" | "report" | "settings";
export type Journal = {
  id: string;
  date: string;
  emotions: Emotion[];
  body: string;
  comfortMessage: string;
  createdAt: string;
};
export type Screening = { id: string; date: string; score: number; safety: boolean };
export type UserData = { journals: Journal[]; screenings: Screening[]; name: string };

export const emotionIcons: Record<Emotion, string> = {
  기쁨: "☀️",
  설렘: "✨",
  감사: "🌿",
  사랑: "💗",
  평온: "🌙",
  희망: "🌱",
  뿌듯함: "⭐",
  즐거움: "🎈",
  슬픔: "🌧️",
  불안: "🌫️",
  화남: "🔥",
  외로움: "🌌",
  무기력: "🫧",
  두려움: "🌑",
  혼란스러움: "🌀",
  지침: "🍂",
};
export const questions = screeningQuestions;
export const answerLabels = screeningAnswerLabels;
export const comfortMessage = createComfortMessage;
export { calculateStreak, emotionStats, koreanDate, lastDays, localIsoDate };
