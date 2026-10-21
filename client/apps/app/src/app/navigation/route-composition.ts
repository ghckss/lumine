import type { AppRoute, PageName } from "./routes";

type Navigate = (page: PageName, params?: AppRoute["params"]) => void;

export function createHomeRouteActions(navigate: Navigate) {
  return {
    onOpenMenu: () => navigate("menu"),
    onOpenScreening: () => navigate("check-start"),
    onOpenReport: () => navigate("mind-report"),
    onOpenDiary: () => navigate("diary"),
    onOpenRecords: () => navigate("records"),
    onOpenRecord: (recordId: string) => navigate("record-detail", { recordId })
  };
}

export function createReportRouteActions(navigate: Navigate) {
  return {
    onOpenDiary: () => navigate("diary"),
    onOpenSafetyHelp: () => navigate("safety-help"),
    onOpenRecord: (recordId: string) => navigate("record-detail", { recordId })
  };
}

export function createMenuRouteActions(navigate: Navigate) {
  return {
    onOpenDataManagement: () => navigate("data-management"),
    onOpenSafetyHelp: () => navigate("safety-help"),
    onOpenTerms: () => navigate("terms"),
    onOpenPrivacy: () => navigate("privacy")
  };
}

export function guestMigrationSyncBadge(input: {
  phase: "idle" | "prompt" | "syncing" | "completed" | "needs_attention" | "declined";
  totalCount: number;
  syncedCount: number;
}) {
  if (input.phase === "syncing") return "진행 중";
  if (input.phase === "completed") return "완료";
  return input.totalCount > 0
    ? `${input.totalCount - input.syncedCount}개 확인`
    : "대기 기록 없음";
}

export async function deleteAccountAndClearContent(input: {
  deleteAccount: () => Promise<void>;
  clearJournalContent: () => Promise<void>;
  clearScreeningContent: () => Promise<void>;
}) {
  await input.deleteAccount();
  await Promise.all([
    Promise.resolve().then(input.clearJournalContent),
    Promise.resolve().then(input.clearScreeningContent)
  ]).catch(() => undefined);
}
