export type AuthProvider = "kakao" | "google";

export type SignupPayload = {
  provider: AuthProvider;
  gender: "female" | "male" | "other";
  birthDate: string;
  agreedToTerms: boolean;
};

export type AuthProfile = {
  userId: string;
  provider: AuthProvider;
  displayName: string;
};

export type QuestionnaireOption = {
  value: string;
  label: string;
  score?: number;
};

export type QuestionnaireItem = {
  id: string;
  kind: "single_choice" | "long_text";
  title: string;
  description?: string;
  required: boolean;
  options?: QuestionnaireOption[];
};

export type QuestionnaireSection = {
  id: string;
  title: string;
  items: QuestionnaireItem[];
};

export type ScreeningQuestionnaire = {
  version: string;
  title: string;
  subtitle: string;
  sections: QuestionnaireSection[];
};

export type ScreeningSubmission = {
  answers: Record<string, string>;
};

export type ScreeningResult = {
  publicSummary: string;
  publicComfortMessage: string;
  recommendedActions: string[];
  recommendedRescreenAt: string;
  requiresSafetyPrompt: boolean;
};

export type JournalEmotion = {
  id: string;
  label: string;
};

export type JournalEntry = {
  date: string;
  emotions: JournalEmotion[];
  body: string;
  comfortMessage: string;
};

export type JournalEntryPayload = {
  date: string;
  emotions: string[];
  body: string;
};

export type SupportResource = {
  code: string;
  title: string;
  phone: string;
  description: string;
};
