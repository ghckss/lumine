import { RecommendedActionsSection } from "./_component/RecommendedActionsSection";
import { ResultFooterActions } from "./_component/ResultFooterActions";
import { ResultLoadingSection } from "./_component/ResultLoadingSection";
import { ResultSummarySection } from "./_component/ResultSummarySection";
import { SafetyPromptSection } from "./_component/SafetyPromptSection";
import { serverApi } from "@/shared/lib/server-api";

export const dynamic = "force-dynamic";

export default async function ScreeningResultPage() {
  const result = await serverApi.getLatestScreening().catch(() => null);
  const actions = result?.recommendedActions ?? [];

  return (
    <div className="min-h-screen pb-24 pt-8 text-onSurface">
      <main className="mx-auto w-full max-w-xl px-6">
        {!result ? <ResultLoadingSection /> : null}
        {result?.requiresSafetyPrompt ? <SafetyPromptSection /> : null}
        <ResultSummarySection result={result} />
        <RecommendedActionsSection actions={actions} />
        <ResultFooterActions />
      </main>
    </div>
  );
}
