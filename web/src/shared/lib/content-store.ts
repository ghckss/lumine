import type {
  JournalEntry,
  ScreeningHistoryItem,
  ScreeningQuestionnaire,
  ScreeningResult
} from "@/shared/lib/api";
import { api } from "@/shared/lib/api";
import { getTodayDate } from "@/shared/lib/date";
import { getDeviceValue, setDeviceValue, type BootstrapMode } from "@/shared/lib/bridge-device";

const JOURNAL_HISTORY_KEY = "journal.history";
const SCREENING_HISTORY_KEY = "screening.history";
const SCREENING_LATEST_KEY = "screening.latest";
const PENDING_SYNC_KEY = "sync.queue";

type CachedScreeningResult = ScreeningResult & { completedDate: string };

type PendingSyncItem =
  | {
      id: string;
      type: "journal";
      payload: {
        date: string;
        emotions: string[];
        body: string;
      };
    }
  | {
      id: string;
      type: "screening";
      payload: {
        answers: Record<string, string>;
      };
    };

async function enqueuePendingSync(item: PendingSyncItem) {
  const queue = (await getDeviceValue<PendingSyncItem[]>(PENDING_SYNC_KEY)) ?? [];
  const nextQueue = [item, ...queue.filter((queued) => queued.id !== item.id)].slice(0, 50);
  await setDeviceValue(PENDING_SYNC_KEY, nextQueue);
}


function journalEntryKey(date: string) {
  return `journal.entry.${date}`;
}

function comfortMessageForGuest(emotions: string[]) {
  const heavy = ["지침", "답답함", "무거움", "불안함", "외로움", "분노", "괴로움", "서운함"];
  const heavyCount = emotions.filter((emotion) => heavy.includes(emotion)).length;
  const leadEmotion = emotions[0] ?? "마음";

  if (heavyCount > 0) {
    return `오늘 ${leadEmotion}이 오래 머물렀다면, 그 마음을 견디느라 많이 애썼을 거예요.`;
  }

  return "오늘 마음을 여기까지 데려오느라 애썼어요. 잠시 그대로 쉬어가도 괜찮아요.";
}

function addWeeks(date: Date, weeks: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + weeks * 7);
  return nextDate.toISOString().slice(0, 10);
}

function evaluateGuestScreening(
  questionnaire: ScreeningQuestionnaire,
  answers: Record<string, string>
): CachedScreeningResult {
  const items = questionnaire.sections.flatMap((section) => section.items);
  const scoreById = new Map(
    items.map((item) => [item.id, new Map(item.options.map((option) => [option.value, option.score ?? 0]))])
  );
  const totalScore = Object.entries(answers).reduce((sum, [id, value]) => sum + (scoreById.get(id)?.get(value) ?? 0), 0);
  const requiresSafetyPrompt = (scoreById.get("q9")?.get(answers.q9) ?? 0) >= 3 || (scoreById.get("q10")?.get(answers.q10) ?? 0) >= 3;

  if (requiresSafetyPrompt) {
    return {
      completedDate: getTodayDate(),
      publicSummary: "오늘은 유난히 무거운 결이 오래 머문 것 같아요.",
      publicComfortMessage: "지금 이 마음을 혼자 오래 붙잡고 있지 않았으면 해요. 먼저 기댈 수 있는 연결을 확인해봐요.",
      recommendedActions: ["도움 연결 화면을 먼저 열어봐요.", "혼자 있기보다 가까운 사람에게 지금 상태를 알려봐요.", "괜찮다면 짧게라도 지금 마음을 남겨봐요."],
      recommendedRescreenAt: addWeeks(new Date(), 4),
      requiresSafetyPrompt: true
    };
  }

  if (totalScore >= 20) {
    return {
      completedDate: getTodayDate(),
      publicSummary: "지친 시간이 꽤 길게 이어지고 있는 것 같아요.",
      publicComfortMessage: "지금의 무게를 너무 혼자 견디지 않았으면 해요. 오늘은 쉬어갈 틈을 먼저 챙겨봐요.",
      recommendedActions: ["오늘 해야 할 일을 가장 작은 단위로 줄여봐요.", "믿을 수 있는 사람에게 지금 컨디션을 한 번 알려봐요.", "잠깐이라도 몸을 기대고 쉬는 시간을 먼저 만들어요."],
      recommendedRescreenAt: addWeeks(new Date(), 4),
      requiresSafetyPrompt: false
    };
  }

  if (totalScore >= 10) {
    return {
      completedDate: getTodayDate(),
      publicSummary: "버거움이 여기저기 겹쳐 있었던 하루 같아요.",
      publicComfortMessage: "조금 지친 흐름이 보이네요. 오늘은 마음을 다그치지 말고, 한숨 돌릴 틈을 만들어봐요.",
      recommendedActions: ["하루를 가장 힘들게 만든 순간을 짧게 적어봐요.", "지금 당장 하지 않아도 되는 일 하나를 덜어내봐요.", "내일 다시 확인할 수 있게 오늘 감정을 남겨봐요."],
      recommendedRescreenAt: addWeeks(new Date(), 4),
      requiresSafetyPrompt: false
    };
  }

  return {
    completedDate: getTodayDate(),
    publicSummary: "지금의 마음을 비교적 차분하게 지나오고 있는 것 같아요.",
    publicComfortMessage: "오늘의 결을 이렇게 살펴본 것만으로도 충분해요. 지금의 평온을 가볍게 붙잡아두면 좋아요.",
    recommendedActions: ["편안했던 순간을 하나만 더 떠올려봐요.", "오늘의 감정을 짧게 기록해두면 흐름이 더 잘 보여요.", "다음에 다시 돌아볼 수 있게 이 마음을 조용히 남겨봐요."],
    recommendedRescreenAt: addWeeks(new Date(), 4),
    requiresSafetyPrompt: false
  };
}

export async function getJournalEntryContent(date: string, mode: BootstrapMode) {
  try {
    const entry = await api.getJournalEntry(date);
    if (entry) {
      await setDeviceValue(journalEntryKey(date), entry);
    }
    return entry;
  } catch {
    return getDeviceValue<JournalEntry>(journalEntryKey(date));
  }
}

export async function getJournalHistoryContent(mode: BootstrapMode, limit = 10) {
  try {
    const entries = await api.getJournalHistory(limit);
    await setDeviceValue(JOURNAL_HISTORY_KEY, entries);
    return entries;
  } catch {
    const entries = (await getDeviceValue<JournalEntry[]>(JOURNAL_HISTORY_KEY)) ?? [];
    return entries.slice(0, limit);
  }
}

export async function saveJournalEntryContent(
  payload: { date: string; emotions: string[]; body: string },
  mode: BootstrapMode
) {
  try {
    const entry = await api.saveJournalEntry(payload);
    const history = (await getDeviceValue<JournalEntry[]>(JOURNAL_HISTORY_KEY)) ?? [];
    const nextHistory = [entry, ...history.filter((item) => item.date !== entry.date)].slice(0, 30);
    await setDeviceValue(journalEntryKey(entry.date), entry);
    await setDeviceValue(JOURNAL_HISTORY_KEY, nextHistory);
    return entry;
  } catch {
    if (mode !== "guest") {
      throw new Error("감정 기록을 저장하지 못했습니다.");
    }

    const entry: JournalEntry = {
      date: payload.date,
      emotions: payload.emotions.map((emotion, index) => ({ id: `${payload.date}-${index}`, label: emotion })),
      body: payload.body,
      comfortMessage: comfortMessageForGuest(payload.emotions),
      createdAt: new Date().toISOString()
    };
    const history = (await getDeviceValue<JournalEntry[]>(JOURNAL_HISTORY_KEY)) ?? [];
    const nextHistory = [entry, ...history.filter((item) => item.date !== entry.date)].slice(0, 30);
    await setDeviceValue(journalEntryKey(entry.date), entry);
    await setDeviceValue(JOURNAL_HISTORY_KEY, nextHistory);
    await enqueuePendingSync({
      id: `journal:${entry.date}`,
      type: "journal",
      payload
    });
    return entry;
  }
}

export async function getScreeningLatestContent(mode: BootstrapMode) {
  try {
    const result = await api.getLatestScreening();
    if (result) {
      await setDeviceValue(SCREENING_LATEST_KEY, { ...result, completedDate: getTodayDate() });
    }
    return result;
  } catch {
    const result = await getDeviceValue<CachedScreeningResult>(SCREENING_LATEST_KEY);
    return result ? toScreeningResult(result) : null;
  }
}

export async function getScreeningHistoryContent(mode: BootstrapMode) {
  try {
    const history = await api.getScreeningHistory();
    await setDeviceValue(SCREENING_HISTORY_KEY, history);
    return history;
  } catch {
    return (await getDeviceValue<ScreeningHistoryItem[]>(SCREENING_HISTORY_KEY)) ?? [];
  }
}

export async function submitScreeningContent(
  questionnaire: ScreeningQuestionnaire,
  payload: { answers: Record<string, string> },
  mode: BootstrapMode
) {
  try {
    const result = await api.submitScreening(payload);
    const history = (await getDeviceValue<ScreeningHistoryItem[]>(SCREENING_HISTORY_KEY)) ?? [];
    const historyItem: ScreeningHistoryItem = {
      completedDate: getTodayDate(),
      publicSummary: result.publicSummary,
      recommendedRescreenAt: result.recommendedRescreenAt,
      requiresSafetyPrompt: result.requiresSafetyPrompt
    };
    await setDeviceValue(SCREENING_LATEST_KEY, { ...result, completedDate: historyItem.completedDate });
    await setDeviceValue(
      SCREENING_HISTORY_KEY,
      [historyItem, ...history.filter((item) => item.completedDate !== historyItem.completedDate)].slice(0, 20)
    );
    return result;
  } catch {
    if (mode !== "guest") {
      throw new Error("설문 분석을 완료하지 못했습니다.");
    }

    const result = evaluateGuestScreening(questionnaire, payload.answers);
    const history = (await getDeviceValue<ScreeningHistoryItem[]>(SCREENING_HISTORY_KEY)) ?? [];
    const historyItem: ScreeningHistoryItem = {
      completedDate: result.completedDate,
      publicSummary: result.publicSummary,
      recommendedRescreenAt: result.recommendedRescreenAt,
      requiresSafetyPrompt: result.requiresSafetyPrompt
    };
    await setDeviceValue(SCREENING_LATEST_KEY, result);
    await setDeviceValue(SCREENING_HISTORY_KEY, [historyItem, ...history.filter((item) => item.completedDate !== historyItem.completedDate)].slice(0, 20));
    await enqueuePendingSync({
      id: `screening:${result.completedDate}`,
      type: "screening",
      payload
    });
    return toScreeningResult(result);
  }
}

function toScreeningResult(result: CachedScreeningResult): ScreeningResult {
  return {
    publicSummary: result.publicSummary,
    publicComfortMessage: result.publicComfortMessage,
    recommendedActions: result.recommendedActions,
    recommendedRescreenAt: result.recommendedRescreenAt,
    requiresSafetyPrompt: result.requiresSafetyPrompt
  };
}
