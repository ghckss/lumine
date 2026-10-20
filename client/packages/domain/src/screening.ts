import type {
  ScreeningQuestion,
  ScreeningQuestionOption,
  ScreeningQuestionnaire,
} from "./index";

export const screeningAnswerOptions: ScreeningQuestionOption[] = [
  { value: "0", label: "전혀 없었어요", score: 0 },
  { value: "1", label: "가끔 있었어요", score: 1 },
  { value: "2", label: "자주 있었어요", score: 2 },
  { value: "3", label: "거의 매일 있었어요", score: 3 },
];

export const screeningQuestions = [
  "일이나 여가 활동에서 흥미나 즐거움을 거의 느끼지 못했나요?",
  "기분이 가라앉거나 우울하거나, 희망이 없다고 느꼈나요?",
  "잠들기 어렵거나 계속 잠을 유지하기 어려웠나요? 혹은 너무 많이 잤나요?",
  "피곤함을 느끼거나 기운이 거의 없었나요?",
  "식욕이 없거나 반대로 너무 많이 먹었나요?",
  "스스로 실패자라고 느끼거나 자신 또는 가족을 실망시켰다고 느꼈나요?",
  "독서나 대화, TV 시청 등에 집중하기 어려웠나요?",
  "평소보다 너무 느리게 움직이거나, 반대로 안절부절못했나요?",
  "차라리 사라지는 편이 낫겠다는 생각이나 스스로를 해칠 생각이 들었나요?",
  "불안하거나 걱정이 되거나 초조한 느낌이 들었나요?",
] as const;

export const screeningAnswerLabels = screeningAnswerOptions.map(
  (option) => option.label,
);

const fallbackItems: ScreeningQuestion[] = screeningQuestions.map(
  (title, index) => ({
    id: `q${index + 1}`,
    kind: "single_choice",
    title,
    required: true,
    options: screeningAnswerOptions,
  }),
);

export const fallbackQuestionnaire: ScreeningQuestionnaire = {
  version: "fallback-v1",
  title: "마음 상태 확인",
  subtitle: "지난 2주간의 마음을 천천히 살펴볼게요.",
  sections: [
    {
      id: "base",
      title: "지난 2주",
      items: [
        ...fallbackItems,
        {
          id: "free",
          kind: "long_text",
          title:
            "요즘 마음에 가장 많이 남아 있는 것이 있다면 자유롭게 적어주세요.",
          required: false,
          options: [],
        },
      ],
    },
  ],
};
