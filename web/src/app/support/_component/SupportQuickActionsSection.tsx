import type { SupportResource } from "@/shared/lib/api";

export function SupportQuickActionsSection({
  onNotifySomeone,
  primaryResource
}: {
  onNotifySomeone: () => void;
  primaryResource?: SupportResource;
}) {
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
        onClick={onNotifySomeone}
        className="flex h-14 items-center justify-center rounded-full bg-surfaceContainerLowest px-6 text-sm font-semibold text-onSurface shadow-ambient"
      >
        주변 사람에게 알리기
      </button>
    </section>
  );
}
