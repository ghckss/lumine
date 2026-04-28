import type {
  JournalEntry,
  ScreeningQuestionnaire,
  ScreeningResult,
  SupportResource
} from "@/shared/types/domain";

export const mockQuestionnaire: ScreeningQuestionnaire = {
  version: "2026-04-ko-mvp",
  title: "지금 마음을 가볍게 살펴봐요",
  subtitle: "몇 가지 질문에 답하면서 오늘 상태를 정리해봐요",
  sections: [
    {
      id: "core",
      title: "오늘의 흐름",
      items: [
        {
          id: "q1",
          kind: "single_choice",
          title: "최근 들어, 평소 즐기던 일에 마음이 잘 가지 않았나요?",
          required: true,
          options: [
            { value: "0", label: "마음이 잘 가는 편이에요", score: 0 },
            { value: "1", label: "가끔 마음이 잘 가지 않아요", score: 1 },
            { value: "2", label: "자주 마음이 잘 가지 않아요", score: 2 },
            { value: "3", label: "거의 매일 마음이 잘 가지 않아요", score: 3 }
          ]
        },
        {
          id: "q2",
          kind: "single_choice",
          title: "마음이 가라앉거나 버겁게 느껴지는 날이 있었나요?",
          required: true,
          options: [
            { value: "0", label: "거의 느끼지 않았어요", score: 0 },
            { value: "1", label: "가끔 그런 날이 있었어요", score: 1 },
            { value: "2", label: "자주 그런 날이 있었어요", score: 2 },
            { value: "3", label: "거의 매일 그랬어요", score: 3 }
          ]
        },
        {
          id: "q3",
          kind: "single_choice",
          title: "잠드는 일이나 잠을 이어가는 일이 평소보다 어려웠나요?",
          required: true,
          options: [
            { value: "0", label: "잠드는 데 큰 어려움은 없었어요", score: 0 },
            { value: "1", label: "가끔 어려웠어요", score: 1 },
            { value: "2", label: "자주 어려웠어요", score: 2 },
            { value: "3", label: "거의 매일 어려웠어요", score: 3 }
          ]
        }
      ]
    },
    {
      id: "narrative",
      title: "조금 더 들려주세요",
      items: [
        {
          id: "n1",
          kind: "long_text",
          title: "요즘 가장 자주 마음에 남는 일이 있다면 적어볼래요?",
          description: "꼭 적지 않아도 괜찮아요. 털어놓고 싶은게 있을때만 적어주세요.",
          required: false
        }
      ]
    } 
  ]
};

export const mockScreeningResult: ScreeningResult = {
  publicSummary: "요즘 혼자 버티는 시간이 조금 길어졌던 것 같아요.",
  publicComfortMessage: "대답해줘서 고마워요.",
  recommendedActions: [
    "오늘 감정을 짧게라도 기록해봐요.",
    "믿을 수 있는 사람 한 명에게 지금 마음을 나눠봐요.",
    "며칠 더 힘들다면 다시 한 번 상태를 살펴봐요."
  ],
  recommendedRescreenAt: "2026-05-25",
  requiresSafetyPrompt: false
}; 

export const mockJournalEntries: JournalEntry[] = [
  {
    date: "2026-04-28",
    emotions: [
      { id: "calm", label: "차분함" },
      { id: "relief", label: "안도감" },
      { id: "gratitude", label: "고마움" }
    ],
    body: "오전에 조금 바빴지만, 저녁에는 한숨 돌릴 수 있었어요.",
    comfortMessage: "가벼워진 마음이 조금 보이네요. 오늘의 결을 잘 남겨줬어요."
  },
  {
    date: "2026-04-27",
    emotions: [
      { id: "tired", label: "지침" },
      { id: "heavy", label: "답답함" },
      { id: "calm", label: "차분함" }
    ],
    body: "하루가 길었지만, 저녁이 되니 조금은 정리되는 느낌이 들었어요.",
    comfortMessage: "지친 하루 속에서도 마음을 남겨줘서 고마워요."
  },
  {
    date: "2026-04-26",
    emotions: [
      { id: "lonely", label: "외로움" },
      { id: "tired", label: "지침" },
      { id: "calm", label: "차분함" }
    ],
    body: "사람들 사이에 있었는데도 혼자 있는 느낌이 오래 갔어요.",
    comfortMessage: "복잡한 마음을 그냥 두지 않고 적어준 것만으로도 충분해요."
  },
  {
    date: "2026-04-25",
    emotions: [
      { id: "relief", label: "안도감" },
      { id: "comfort", label: "편안함" },
      { id: "joy", label: "즐거움" }
    ],
    body: "오랜만에 편하게 웃을 수 있는 시간이 있었어요.",
    comfortMessage: "가벼운 순간이 분명히 있었네요. 그 감정도 충분히 소중해요."
  },
  {
    date: "2026-04-24",
    emotions: [
      { id: "anxiety", label: "불안함" },
      { id: "frustration", label: "답답함" },
      { id: "anger", label: "분노" }
    ],
    body: "계속 신경 쓰이는 일이 있어서 하루 종일 마음이 날카로웠어요.",
    comfortMessage: "버거웠던 마음이 컸네요. 그 시간을 잘 지나와 줬어요."
  },
  {
    date: "2026-04-23",
    emotions: [
      { id: "heaviness", label: "무거움" },
      { id: "sorrow", label: "괴로움" },
      { id: "tired", label: "지침" }
    ],
    body: "아무것도 아닌 일에도 마음이 쉽게 가라앉았어요.",
    comfortMessage: "무거운 하루였네요. 오늘을 남긴 것만으로도 충분해요."
  },
  {
    date: "2026-04-22",
    emotions: [
      { id: "anxiety", label: "불안함" },
      { id: "heaviness", label: "무거움" },
      { id: "lonely", label: "외로움" }
    ],
    body: "괜찮은 척했는데 집에 오니 힘이 확 빠졌어요.",
    comfortMessage: "버틴 마음이 느껴져요. 여기에는 솔직해도 괜찮아요."
  },
  {
    date: "2026-04-21",
    emotions: [
      { id: "frustration", label: "답답함" },
      { id: "tired", label: "지침" },
      { id: "sadness", label: "서운함" }
    ],
    body: "계획대로 되지 않는 일이 겹쳐서 자꾸만 숨이 막히는 느낌이었어요.",
    comfortMessage: "답답한 하루를 그냥 흘려보내지 않고 붙잡아줘서 고마워요."
  },
  {
    date: "2026-04-20",
    emotions: [
      { id: "sadness", label: "서운함" },
      { id: "heaviness", label: "무거움" },
      { id: "anxiety", label: "불안함" }
    ],
    body: "작은 말 한마디가 생각보다 오래 남았어요.",
    comfortMessage: "쉽게 지나가지 않는 마음이 있었네요. 그대로 두어도 괜찮아요."
  },
  {
    date: "2026-04-19",
    emotions: [
      { id: "sorrow", label: "괴로움" },
      { id: "anger", label: "분노" },
      { id: "tired", label: "지침" }
    ],
    body: "하루 내내 예민하고 지쳐서 누구와도 말하고 싶지 않았어요.",
    comfortMessage: "많이 지친 날이었네요. 잘 버텨줘서 고마워요."
  }
];

export const mockJournalEntry: JournalEntry = mockJournalEntries[0];

export const mockSupportResources: SupportResource[] = [
  {
    code: "suicide-prevention",
    title: "자살예방상담전화",
    phone: "109",
    description: "24시간 연결 가능한 도움 전화예요"
  },
  {
    code: "emergency",
    title: "응급전화",
    phone: "119",
    description: "지금 바로 도움이 필요할 때 연결해요"
  },
  {
    code: "welfare",
    title: "보건복지상담센터",
    phone: "129",
    description: "보건복지 관련 상담을 도와줘요"
  }
];
