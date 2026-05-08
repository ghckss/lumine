import Link from "next/link";

function SurfaceCard({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`rounded-[28px] bg-surfaceContainerLowest px-5 py-5 shadow-ambient ${className}`}>{children}</section>;
}

export function ReflectionPromptSection({
  daysSinceLatestScreening
}: {
  daysSinceLatestScreening: number | null;
}) {
  return (
    <Link href="/screening/start" className="block">
      <SurfaceCard className="relative overflow-hidden rounded-[24px] border border-primary/15 bg-[linear-gradient(135deg,var(--color-primary)_0%,color-mix(in_srgb,var(--color-primary)_72%,var(--color-on-primary-container))_100%)] px-5 py-4 text-white shadow-moon transition-transform hover:-translate-y-0.5">
        <div className="absolute right-[-34px] top-[-48px] h-28 w-28 rounded-full bg-white/15 blur-xl" />
        <div className="relative z-10">
          <p className="text-[0.68rem] uppercase tracking-[0.2em] text-white/60">reflection</p>
          <h2 className="mt-2 text-[1.25rem] leading-[1.28] text-white">
            {daysSinceLatestScreening === null
              ? "지금의 나를 처음 둘러볼 시간이에요"
              : "최근 나를 둘러본 지 30일이 지났어요"}
          </h2>
          <p className="mt-2 text-[0.82rem] leading-6 text-white/80">
            {daysSinceLatestScreening === null
              ? "지금의 기준점을 남겨두면, 다음 변화가 어디서 시작됐는지 더 선명하게 볼 수 있어요."
              : "그 사이 나에게 어떤 변화가 있었을지 다시 한번 확인해봐요."}
          </p>
          <div className="mt-4 flex justify-end">
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary">나를 돌아보기</span>
          </div>
        </div>
      </SurfaceCard>
    </Link>
  );
}
