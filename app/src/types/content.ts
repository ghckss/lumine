export type PageName =
  | "home"
  | "check-start"
  | "check-question"
  | "check-result"
  | "safety-result"
  | "diary"
  | "records"
  | "record-detail"
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

export type ScreeningResult = {
  id: string;
  completedDate: string;
  publicSummary: string;
  publicComfortMessage: string;
  recommendedActions: string[];
  recommendedRescreenAt: string;
  requiresSafetyPrompt: boolean;
};

export type ScreeningQuestionOption = { value: string; label: string; score?: number | null };
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

export const emotions = [
  "기쁨", "설렘", "감사", "사랑", "평온", "희망", "뿌듯함", "즐거움",
  "슬픔", "불안", "화남", "외로움", "무기력", "두려움", "혼란스러움", "지침"
];

export const emotionColors: Record<string, string> = {
  기쁨: "#F9C846", 설렘: "#F9A26C", 감사: "#7FC8A9", 사랑: "#F77E8C",
  평온: "#A8D8EA", 희망: "#9BE3B8", 뿌듯함: "#B4A9E8", 즐거움: "#FDCA40",
  슬픔: "#8EA8C3", 불안: "#C9A9A6", 화남: "#E87171", 외로움: "#B0B7C3",
  무기력: "#C0BBA9", 두려움: "#9B8EA4", 혼란스러움: "#D4B896", 지침: "#AAACB0"
};

export function getEmotionColor(emotion: string) {
  return emotionColors[emotion] ?? "#B4A9E8";
}

const choices: ScreeningQuestionOption[] = [
  { value: "0", label: "전혀 없었어요", score: 0 },
  { value: "1", label: "가끔 있었어요", score: 1 },
  { value: "2", label: "자주 있었어요", score: 2 },
  { value: "3", label: "거의 매일 있었어요", score: 3 }
];

export const fallbackQuestionnaire: ScreeningQuestionnaire = {
  version: "native-fallback-v1",
  title: "마음 상태 확인",
  subtitle: "지난 2주간의 마음을 천천히 살펴볼게요.",
  sections: [{
    id: "base",
    title: "지난 2주",
    items: [
      "일이나 여가활동에서 흥미나 즐거움을 거의 느끼지 못했나요?",
      "기분이 가라앉거나, 우울하거나, 희망이 없다고 느꼈나요?",
      "잠들기 어렵거나 계속 잠을 유지하기 어려웠나요? 혹은 너무 많이 잤나요?",
      "피곤함을 느끼거나 기운이 거의 없었나요?",
      "식욕이 없거나 반대로 너무 많이 드셨나요?",
      "자신이 실패자라는 느낌이나 자신 또는 가족에게 실망을 줬다는 느낌이 들었나요?",
      "집중하기 어려웠나요? (예: 독서, 대화, TV 시청)",
      "너무 느리게 움직이거나 말한다고 느꼈나요? 반대로 너무 안절부절못했나요?",
      "차라리 죽는 것이 낫겠다는 생각이나 어떤 방식으로든 자신을 해치려는 생각을 했나요?",
      "불안하거나 걱정이 되거나 초조한 느낌이 들었나요?"
    ].map((title, index) => ({ id: `q${index + 1}`, kind: "single_choice", title, required: true, options: choices })).concat([
      { id: "free", kind: "long_text", title: "요즘 마음에 가장 많이 남아 있는 것이 있다면 자유롭게 적어주세요.", required: false, options: [] }
    ])
  }]
};
