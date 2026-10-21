// Compatibility adapter for the legacy screen path.
import React from "react";
import { BottomTabs, useNavigation } from "../../app/navigation";
import { useSession } from "../../features/auth";
import { HomeScreen as FeatureHomeScreen } from "../../features/home";
import { useJournal } from "../../features/journal";
import { useScreening } from "../../features/screening";

export function HomeScreen() {
  const { navigate } = useNavigation();
  const { session } = useSession();
  const journal = useJournal();
  const screening = useScreening();
  return (
    <FeatureHomeScreen
      journalRecords={journal.journalRecords}
      screeningResults={screening.screeningResults}
      isLoading={journal.isJournalLoading || screening.isScreeningLoading}
      isGuest={!session}
      displayName={session?.displayName}
      footer={<BottomTabs />}
      onOpenMenu={() => navigate("menu")}
      onOpenScreening={() => navigate("check-start")}
      onOpenReport={() => navigate("mind-report")}
      onOpenDiary={() => navigate("diary")}
      onOpenRecords={() => navigate("records")}
      onOpenRecord={(recordId) => navigate("record-detail", { recordId })}
    />
  );
}
