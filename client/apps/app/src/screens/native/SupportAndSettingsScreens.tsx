// Compatibility adapters for the legacy screen path.
import React from "react";
import { DataManagementScreen as AccountDataManagementScreen, MenuScreen as AccountMenuScreen } from "../../features/account";
import { useSession } from "../../features/auth";
import { useJournal } from "../../features/journal";
import { useScreening } from "../../features/screening";
import { LegalScreen as SupportLegalScreen, SafetyHelpScreen as SupportSafetyHelpScreen } from "../../features/support";
import { TopBar, useNavigation } from "../../app/navigation";
import { deleteAccountAndClearContent, guestMigrationSyncBadge } from "../../app/navigation/route-composition";

export function SafetyHelpScreen() {
  const { navigate } = useNavigation();
  return <SupportSafetyHelpScreen header={<TopBar title="도움 요청" showMenu />} onOpenDiary={() => navigate("diary")} />;
}

export function MenuScreen({ onRequestLogin }: { onRequestLogin: () => void }) {
  const { navigate } = useNavigation();
  const { session, guestMigration, logout, requestGuestMigration } = useSession();
  const { journalRecords } = useJournal();
  const { screeningResults } = useScreening();
  return (
    <AccountMenuScreen
      isGuest={!session}
      displayName={session?.displayName}
      journalCount={journalRecords.length}
      screeningCount={screeningResults.length}
      syncBadge={guestMigrationSyncBadge(guestMigration)}
      header={<TopBar title="메뉴" />}
      onRequestLogin={onRequestLogin}
      onRequestGuestMigration={() => void requestGuestMigration()}
      onOpenDataManagement={() => navigate("data-management")}
      onOpenSafetyHelp={() => navigate("safety-help")}
      onOpenTerms={() => navigate("terms")}
      onOpenPrivacy={() => navigate("privacy")}
      onLogout={() => void logout()}
    />
  );
}

export function DataManagementScreen() {
  const { deleteAccount } = useSession();
  const { clearJournalContent } = useJournal();
  const { clearScreeningContent } = useScreening();
  return (
    <AccountDataManagementScreen
      header={<TopBar title="내 데이터 관리" />}
      onDeleteAccount={() => deleteAccountAndClearContent({ deleteAccount, clearJournalContent, clearScreeningContent })}
    />
  );
}

export function LegalScreen({ type }: { type: "terms" | "privacy" }) {
  return <SupportLegalScreen type={type} header={<TopBar title={type === "terms" ? "이용약관" : "개인정보처리방침"} />} />;
}
