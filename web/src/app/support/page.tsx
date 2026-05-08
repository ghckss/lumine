import { serverApi } from "@/shared/lib/server-api";
import { SupportHeroSection } from "./_component/SupportHeroSection";
import { SupportJournalLinkSection } from "./_component/SupportJournalLinkSection";
import { SupportQuickActionsSection } from "./_component/SupportQuickActionsSection";
import { SupportResourceListSection } from "./_component/SupportResourceListSection";
import { SupportSafetyNoticeSection } from "./_component/SupportSafetyNoticeSection";

type SupportPageProps = {
  searchParams?: Promise<{ source?: string | string[] }>;
};

export const revalidate = 60 * 60;

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const source = Array.isArray(resolvedSearchParams.source) ? resolvedSearchParams.source[0] : resolvedSearchParams.source;
  const resources = await serverApi.getSupportResources().catch(() => []);
  const primaryResource = resources[0];
  const secondaryResources = resources.slice(1);
  const fromSafetyFlow = source === "safety";

  return (
    <div className="min-h-screen pb-24 font-body text-onSurface">
      <main className="mx-auto w-full max-w-xl px-6 pt-8">
        {fromSafetyFlow ? <SupportSafetyNoticeSection /> : null}
        <SupportHeroSection />
        <SupportQuickActionsSection primaryResource={primaryResource} />
        <SupportResourceListSection
          primaryResource={primaryResource}
          resources={resources}
          secondaryResources={secondaryResources}
        />
        <SupportJournalLinkSection />
      </main>
    </div>
  );
}
