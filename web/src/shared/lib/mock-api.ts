import { mockJournalEntries, mockJournalEntry, mockQuestionnaire, mockScreeningResult, mockSupportResources } from "./mock-data";
import type { ApiResponse } from "@/shared/types/api";
import type {
  AuthProvider,
  AuthProfile,
  JournalEntry,
  JournalEntryPayload,
  ScreeningQuestionnaire,
  ScreeningResult,
  ScreeningSubmission,
  SignupPayload,
  SupportResource
} from "@/shared/types/domain";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const positiveEmotionSet = new Set(["차분함", "안도감", "기쁨", "즐거움", "행복", "고마움", "편안함", "설렘"]);
const heavyEmotionSet = new Set(["지침", "답답함", "무거움", "불안함", "서운함", "외로움", "분노", "괴로움"]);
const journalEntries = new Map<string, JournalEntry>(mockJournalEntries.map((entry) => [entry.date, entry] as const));

export async function mockLogin(provider: AuthProvider): Promise<ApiResponse<AuthProfile>> {
  await sleep(300);
  return {
    data: {
      userId: provider === "kakao" ? "mock-kakao-001" : "mock-google-001",
      provider,
      displayName: provider === "kakao" ? "하린" : "서윤"
    }
  };
}

export async function mockSignup(
  payload: SignupPayload
): Promise<ApiResponse<AuthProfile>> {
  await sleep(350);
  return {
    data: {
      userId: "mock-user-001",
      provider: payload.provider,
      displayName: payload.provider === "kakao" ? "하린" : "서윤"
    }
  };
}

export async function mockGetQuestionnaire(): Promise<ApiResponse<ScreeningQuestionnaire>> {
  await sleep(250);
  return { data: mockQuestionnaire };
}

export async function mockSubmitScreening(
  _payload: ScreeningSubmission
): Promise<ApiResponse<ScreeningResult>> {
  await sleep(400);
  return { data: mockScreeningResult };
}

export async function mockGetLatestScreeningResult(): Promise<ApiResponse<ScreeningResult>> {
  await sleep(200);
  return { data: mockScreeningResult };
}

export async function mockGetJournalEntry(_date: string): Promise<ApiResponse<JournalEntry | null>> {
  await sleep(250);
  return { data: journalEntries.get(_date) ?? null };
}

export async function mockGetJournalEntries(limit = 10): Promise<ApiResponse<JournalEntry[]>> {
  await sleep(280);
  const entries = Array.from(journalEntries.values()).sort((left, right) => right.date.localeCompare(left.date));
  return { data: entries.slice(0, limit) };
}

export async function mockSaveJournalEntry(
  payload: JournalEntryPayload
): Promise<ApiResponse<JournalEntry>> {
  await sleep(450);
  const comfortMessage = createComfortMessage(payload.emotions);
  const entry = {
    date: payload.date,
    emotions: payload.emotions.map((emotion) => ({ id: emotion, label: emotion })),
    body: payload.body,
    comfortMessage
  };

  journalEntries.set(payload.date, entry);

  return {
    data: entry
  };
}

export async function mockGetSupportResources(): Promise<ApiResponse<SupportResource[]>> {
  await sleep(200);
  return { data: mockSupportResources };
}

function createComfortMessage(emotions: string[]) {
  const positiveCount = emotions.filter((emotion) => positiveEmotionSet.has(emotion)).length;
  const heavyCount = emotions.filter((emotion) => heavyEmotionSet.has(emotion)).length;

  if (positiveCount === 3) {
    return "따뜻한 감정이 남아 있었네요. 오늘의 좋은 결을 그대로 간직해도 괜찮아요.";
  }

  if (heavyCount === 3) {
    return "무거운 마음이 겹친 하루였네요. 이렇게 남겨둔 것만으로도 충분히 잘 버틴 거예요.";
  }

  if (positiveCount > 0 && heavyCount > 0) {
    return "가벼운 마음과 무거운 마음이 함께 있었네요. 어느 쪽이든 그대로 느껴도 괜찮아요.";
  }

  return "오늘 마음을 남겨줘서 고마워요. 충분히 잘 해내고 있어요.";
}
