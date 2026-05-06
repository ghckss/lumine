"use client";

import { useScreeningLatest } from "@/shared/hooks/useScreeningLatest";
import { RecommendedActionsSection } from "./_component/RecommendedActionsSection";
import { ResultFetchingNoticeSection } from "./_component/ResultFetchingNoticeSection";
import { ResultFooterActions } from "./_component/ResultFooterActions";
import { ResultLoadingSection } from "./_component/ResultLoadingSection";
import { ResultSummarySection } from "./_component/ResultSummarySection";
import { SafetyPromptSection } from "./_component/SafetyPromptSection";

export default function ScreeningResultPage() {
  const { data: result, isFetching } = useScreeningLatest({ refetchOnMount: "always" });
  const actions = result?.recommendedActions ?? [];

  return (
    <div className="min-h-screen pb-24 pt-8 text-onSurface">
      <main className="mx-auto w-full max-w-xl px-6">
        {!result ? <ResultLoadingSection /> : null}
        {result && isFetching ? <ResultFetchingNoticeSection /> : null}
        {result?.requiresSafetyPrompt ? <SafetyPromptSection /> : null}
        <ResultSummarySection result={result} />
        <RecommendedActionsSection actions={actions} />
        <ResultFooterActions />
      </main>
    </div>
  );
}
