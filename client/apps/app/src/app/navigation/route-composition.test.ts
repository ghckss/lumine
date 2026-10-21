import { describe, expect, it, vi } from "vitest";
import {
  createHomeRouteActions,
  createMenuRouteActions,
  createReportRouteActions,
  deleteAccountAndClearContent,
  guestMigrationSyncBadge
} from "./route-composition";

describe("centralized route composition", () => {
  it("maps representative home, report, and menu actions to routes", () => {
    const navigate = vi.fn();

    const home = createHomeRouteActions(navigate);
    home.onOpenMenu();
    home.onOpenScreening();
    home.onOpenReport();
    home.onOpenDiary();
    home.onOpenRecords();
    home.onOpenRecord("journal-1");

    const report = createReportRouteActions(navigate);
    report.onOpenDiary();
    report.onOpenSafetyHelp();
    report.onOpenRecord("journal-2");

    const menu = createMenuRouteActions(navigate);
    menu.onOpenDataManagement();
    menu.onOpenSafetyHelp();
    menu.onOpenTerms();
    menu.onOpenPrivacy();

    expect(navigate.mock.calls).toEqual([
      ["menu"],
      ["check-start"],
      ["mind-report"],
      ["diary"],
      ["records"],
      ["record-detail", { recordId: "journal-1" }],
      ["diary"],
      ["safety-help"],
      ["record-detail", { recordId: "journal-2" }],
      ["data-management"],
      ["safety-help"],
      ["terms"],
      ["privacy"]
    ]);
  });

  it("formats guest migration state at the app boundary", () => {
    expect(guestMigrationSyncBadge({ phase: "syncing", totalCount: 3, syncedCount: 1 })).toBe("진행 중");
    expect(guestMigrationSyncBadge({ phase: "completed", totalCount: 3, syncedCount: 3 })).toBe("완료");
    expect(guestMigrationSyncBadge({ phase: "prompt", totalCount: 3, syncedCount: 1 })).toBe("2개 확인");
    expect(guestMigrationSyncBadge({ phase: "idle", totalCount: 0, syncedCount: 0 })).toBe("대기 기록 없음");
  });
});

describe("account deletion orchestration", () => {
  it("clears both local feature states after account deletion succeeds", async () => {
    const calls: string[] = [];
    await deleteAccountAndClearContent({
      deleteAccount: async () => { calls.push("delete"); },
      clearJournalContent: async () => { calls.push("journal"); },
      clearScreeningContent: async () => { calls.push("screening"); }
    });
    expect(calls).toEqual(["delete", "journal", "screening"]);
  });

  it("does not clear local feature state when account deletion fails", async () => {
    const clearJournalContent = vi.fn(async () => undefined);
    const clearScreeningContent = vi.fn(async () => undefined);
    await expect(deleteAccountAndClearContent({
      deleteAccount: async () => { throw new Error("delete failed"); },
      clearJournalContent,
      clearScreeningContent
    })).rejects.toThrow("delete failed");
    expect(clearJournalContent).not.toHaveBeenCalled();
    expect(clearScreeningContent).not.toHaveBeenCalled();
  });

  it("attempts both local clears and swallows a local clear rejection", async () => {
    const clearJournalContent = vi.fn(async () => { throw new Error("local clear failed"); });
    const clearScreeningContent = vi.fn(async () => undefined);
    await expect(deleteAccountAndClearContent({
      deleteAccount: async () => undefined,
      clearJournalContent,
      clearScreeningContent
    })).resolves.toBeUndefined();
    expect(clearJournalContent).toHaveBeenCalledOnce();
    expect(clearScreeningContent).toHaveBeenCalledOnce();
  });
});
