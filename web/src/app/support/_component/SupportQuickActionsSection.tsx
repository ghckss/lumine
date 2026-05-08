"use client";

import type { SupportResource } from "@/shared/lib/api";

export function SupportQuickActionsSection({
  primaryResource
}: {
  primaryResource?: SupportResource;
}) {
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
    <section className="mb-8 grid grid-cols-1 gap-3">
      {primaryResource ? (
        <a
          href={`tel:${primaryResource.phone}`}
          className="flex h-14 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary px-6 text-sm font-semibold text-white shadow-moon"
        >
          {primaryResource.phone}로 연결하기
        </a>
      ) : null}
      <a
        href="tel:119"
        className="flex h-14 items-center justify-center rounded-full bg-surfaceContainerLowest px-6 text-sm font-semibold text-secondary shadow-ambient"
      >
        119 도움 요청하기
      </a>
      <button
        type="button"
        onClick={() => void handleNotifySomeone()}
        className="flex h-14 items-center justify-center rounded-full bg-surfaceContainerLowest px-6 text-sm font-semibold text-onSurface shadow-ambient"
      >
        주변 사람에게 알리기
      </button>
    </section>
  );
}
