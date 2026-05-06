export function JournalHistorySummarySection({
  isFetching,
  recentTopEmotions,
  trendMessage
}: {
  isFetching: boolean;
  recentTopEmotions: string[];
  trendMessage: string;
}) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl tracking-wide text-primary">최근 마음의 기록</h2>
      {isFetching ? (
        <p className="text-xs tracking-[0.18em] text-onSurfaceVariant/70">최근 기록을 다시 확인하고 있어요.</p>
      ) : null}
      <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-[2rem] bg-surfaceContainerLow">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-primary-fixed)_0%,var(--color-secondary-container)_45%,var(--color-surface-container)_100%)] opacity-80 mix-blend-multiply" />
        <div className="relative z-10 flex flex-col items-center gap-3 rounded-2xl border border-background/50 bg-background/40 p-6 shadow-moon backdrop-blur-md">
          <span className="text-lg tracking-wider text-primaryContainer">주로 머문 감정</span>
          <div className="flex gap-4">
            {recentTopEmotions.map((emotion) => (
              <span key={emotion} className="rounded-full bg-background/80 px-4 py-1.5 text-sm tracking-widest text-primary shadow-sm">
                {emotion}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="border-l-2 border-primary/20 pl-2 text-sm leading-loose text-onSurfaceVariant">{trendMessage}</p>
    </section>
  );
}
