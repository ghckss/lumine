import Link from "next/link";

export function SafetyPromptSection() {
  return (
    <section className="mb-8 mt-2">
      <div className="overflow-hidden rounded-[28px] border border-secondary/25 bg-[linear-gradient(180deg,var(--color-secondary-container)_0%,var(--color-surface-container-lowest)_100%)] p-6 shadow-moon">
        <p className="text-xs uppercase tracking-[0.22em] text-secondary/80">care first</p>
        <h2 className="mt-3 text-[1.7rem] leading-[1.45] text-onSurface">
          오늘 결과가 조금 무겁게 나왔네요.
        </h2>
        <p className="mt-4 text-sm leading-7 text-onSurfaceVariant">
          혹시 괜찮다면 전문적인 상담을 한 번 받아보는 건 어떨까요? 저는 당신이 더 편안해졌으면 좋겠어요.
          상담을 받으면서도 평소처럼 이곳에 들러주세요. 저는 늘 같은 자리에서 당신을 기다리고 있을게요.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/support"
            className="flex h-14 flex-1 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary px-6 text-sm font-semibold text-white shadow-moon"
          >
            도움 연결 보기
          </Link>
          <Link
            href="/journal"
            className="flex h-14 flex-1 items-center justify-center rounded-full bg-surfaceContainerLowest px-6 text-sm font-semibold text-secondary"
          >
            지금 마음 남기기
          </Link>
        </div>
      </div>
    </section>
  );
}
