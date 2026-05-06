import type { ScreeningResult } from "@/shared/lib/api";

export function ResultSummarySection({ result }: { result?: ScreeningResult | null }) {
  return (
    <section className="relative mb-16 mt-8">
      <div className="relative z-10 overflow-hidden rounded-xl bg-surfaceContainerLowest p-10 md:p-14">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primaryContainer opacity-20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-secondaryContainer opacity-20 blur-3xl" />
        <h2 className="mb-8 text-3xl leading-relaxed tracking-wide text-primary md:text-4xl">
          {result?.publicSummary ?? "최근 상태를 정리하고 있어요."}
        </h2>
        <p className="text-base font-light leading-loose text-onSurfaceVariant">
          {result?.publicComfortMessage ?? "조금만 기다리면 가장 최근 상태를 불러와요."}
        </p>
      </div>
      <div className="absolute inset-0 z-0 translate-y-4 bg-secondary opacity-5 blur-2xl" />
    </section>
  );
}
