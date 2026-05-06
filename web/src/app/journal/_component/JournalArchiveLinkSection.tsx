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

export function JournalArchiveLinkSection() {
  return (
    <Link href="/journal/history">
      <SurfaceCard className="transition hover:-translate-y-0.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-secondary/70">archive</p>
            <p className="mt-2 text-[1.3rem] leading-8 text-onSurface">지난 기록을 다시 볼 수 있어요</p>
            <p className="mt-2 text-sm leading-7 text-onSurfaceVariant">최근 감정 흐름을 한 번에 돌아봐요.</p>
          </div>
          <span className="rounded-full bg-secondaryContainer px-4 py-2 text-xs font-semibold text-secondary">보기</span>
        </div>
      </SurfaceCard>
    </Link>
  );
}
