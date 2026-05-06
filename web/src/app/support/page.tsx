"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSupportResources } from "@/shared/hooks/useSupportResources";
import { SupportHeroSection } from "./_component/SupportHeroSection";
import { SupportJournalLinkSection } from "./_component/SupportJournalLinkSection";
import { SupportQuickActionsSection } from "./_component/SupportQuickActionsSection";
import { SupportResourceListSection } from "./_component/SupportResourceListSection";
import { SupportSafetyNoticeSection } from "./_component/SupportSafetyNoticeSection";

export default function SupportPage() {
  return (
    <Suspense fallback={null}>
      <SupportPageContent />
    </Suspense>
  );
}

function SupportPageContent() {
  const searchParams = useSearchParams();
  const { data: resources = [] } = useSupportResources();
  const primaryResource = resources[0];
  const secondaryResources = resources.slice(1);
  const fromSafetyFlow = searchParams.get("source") === "safety";

  async function handleNotifySomeone() {
    const message = "지금 조금 힘들어서, 괜찮다면 잠깐 이야기 나누고 싶어요.";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: message });
        return;
      } catch {
        return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(message);
    }
  }

  return (
    <div className="min-h-screen pb-24 font-body text-onSurface">
      <main className="mx-auto w-full max-w-xl px-6 pt-8">
        {fromSafetyFlow ? <SupportSafetyNoticeSection /> : null}
        <SupportHeroSection />
        <SupportQuickActionsSection
          onNotifySomeone={() => void handleNotifySomeone()}
          primaryResource={primaryResource}
        />
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
