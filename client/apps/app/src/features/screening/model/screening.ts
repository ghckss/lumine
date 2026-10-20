import { fallbackQuestionnaire, type ScreeningResult as SharedScreeningResult } from "@lumine/domain";

export type ScreeningResult = SharedScreeningResult & {
  id: string;
  completedDate: string;
};

export type {
  ScreeningQuestion,
  ScreeningQuestionOption,
  ScreeningQuestionnaire
} from "@lumine/domain";
export { fallbackQuestionnaire };
