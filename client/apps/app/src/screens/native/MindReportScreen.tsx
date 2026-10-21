// Compatibility adapter for the legacy screen path.
import React from "react";
import { TopBar, useNavigation } from "../../app/navigation";
import { useJournal } from "../../features/journal";
import { MindReportScreen as FeatureMindReportScreen } from "../../features/report";
import { useScreening } from "../../features/screening";

export function MindReportScreen() {
  const { navigate } = useNavigation();
  const { journalRecords } = useJournal();
  const { screeningResults } = useScreening();
  return (
    <FeatureMindReportScreen
      journalRecords={journalRecords}
      screeningResults={screeningResults}
      header={<TopBar title="마음 리포트" />}
      onOpenDiary={() => navigate("diary")}
      onOpenSafetyHelp={() => navigate("safety-help")}
      onOpenRecord={(recordId) => navigate("record-detail", { recordId })}
    />
  );
}
