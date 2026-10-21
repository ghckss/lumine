import React from "react";
import { TopBar, useNavigation } from "../../app/navigation";
import {
  CheckQuestionScreen as FeatureCheckQuestionScreen,
  CheckResultScreen as FeatureCheckResultScreen,
  CheckStartScreen as FeatureCheckStartScreen,
  type ScreeningQuestionnaire,
  type ScreeningResult
} from "../../features/screening";

/** @deprecated Import CheckStartScreen from features/screening and provide navigation callbacks. */
export function CheckStartScreen() {
  const { navigate } = useNavigation();
  return (
    <FeatureCheckStartScreen
      header={<TopBar showMenu />}
      onStart={() => navigate("check-question", { index: 0, answers: {} })}
    />
  );
}

/** @deprecated Import CheckQuestionScreen from features/screening and provide route state explicitly. */
export function CheckQuestionScreen() {
  const { route, goBack, navigate } = useNavigation();
  return (
    <FeatureCheckQuestionScreen
      index={typeof route.params?.index === "number" ? route.params.index : 0}
      previousAnswers={(route.params?.answers as Record<string, string> | undefined) ?? {}}
      initialQuestionnaire={route.params?.questionnaire as ScreeningQuestionnaire | undefined}
      header={<TopBar showMenu onBack={goBack} />}
      onNext={(progress) => navigate("check-question", progress)}
      onComplete={(result) => navigate(result.requiresSafetyPrompt ? "safety-result" : "check-result", { result })}
    />
  );
}

/** @deprecated Import CheckResultScreen from features/screening and provide navigation callbacks. */
export function CheckResultScreen({ safety = false }: { safety?: boolean }) {
  const { route, navigate, resetTo } = useNavigation();
  const result = route.params?.result as ScreeningResult | undefined;
  const header = result
    ? <TopBar title={safety ? "마음이 걱정돼요" : "마음 상태 결과"} showBack={false} showMenu />
    : <TopBar title="마음 상태 결과" />;
  return (
    <FeatureCheckResultScreen
      result={result}
      safety={safety}
      header={header}
      onShowGeneralResult={(screeningResult) => navigate("check-result", { result: screeningResult })}
      onRequestSafetyHelp={() => navigate("safety-help")}
      onWriteJournal={() => navigate("diary")}
      onHome={() => resetTo("home")}
    />
  );
}
