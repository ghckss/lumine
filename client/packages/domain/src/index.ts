export type AuthProvider = "KAKAO" | "GOOGLE";
export type Gender = "FEMALE" | "MALE" | "OTHER";

export type LoginSession = {
  userId: string;
  provider: AuthProvider;
  displayName: string;
  accessToken: string;
};

export type UserProfile = {
  userId: string;
  provider: AuthProvider;
  displayName: string;
  gender: Gender | null;
  birthDate: string | null;
  agreedToTerms: boolean;
  signedUpAt: string | null;
};

export type ScreeningQuestionOption = {
  value: string;
  label: string;
  score?: number | null;
};

export type ScreeningQuestion = {
  id: string;
  kind: "single_choice" | "long_text" | string;
  title: string;
  description?: string | null;
  required: boolean;
  options: ScreeningQuestionOption[];
};

export type ScreeningQuestionnaire = {
  version: string;
  title: string;
  subtitle: string;
  sections: Array<{ id: string; title: string; items: ScreeningQuestion[] }>;
};

export type ScreeningResult = {
  publicSummary: string;
  publicComfortMessage: string;
  recommendedActions: string[];
  recommendedRescreenAt: string;
  requiresSafetyPrompt: boolean;
  comparisonScore?: number;
};

export const emotions = [
  "기쁨",
  "설렘",
  "감사",
  "사랑",
  "평온",
  "희망",
  "뿌듯함",
  "즐거움",
  "슬픔",
  "불안",
  "화남",
  "외로움",
  "무기력",
  "두려움",
  "혼란스러움",
  "지침",
] as const;

export type Emotion = (typeof emotions)[number];

export const emotionColors: Record<Emotion, string> = {
  기쁨: "#F9C846",
  설렘: "#F9A26C",
  감사: "#7FC8A9",
  사랑: "#F77E8C",
  평온: "#A8D8EA",
  희망: "#9BE3B8",
  뿌듯함: "#B4A9E8",
  즐거움: "#FDCA40",
  슬픔: "#8EA8C3",
  불안: "#C9A9A6",
  화남: "#E87171",
  외로움: "#B0B7C3",
  무기력: "#C0BBA9",
  두려움: "#9B8EA4",
  혼란스러움: "#D4B896",
  지침: "#AAACB0",
};

export function getEmotionColor(emotion: string) {
  return emotionColors[emotion as Emotion] ?? "#B4A9E8";
}

export * from "./comfort";
export * from "./date";
export * from "./greeting";
export * from "./journal";
export * from "./report";
export * from "./screening";
