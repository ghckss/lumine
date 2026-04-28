import Link from "next/link";
import { JournalEntryForm } from "@/features/journal/components/journal-entry-form";
import { AppShell } from "@/shared/components/app-shell";
import { SurfaceCard } from "@/shared/components/surface-card";

export default function JournalPage() {
  return (
    <AppShell
      eyebrow="오늘의 기록"
      title="오늘 감정 세 가지만 먼저 붙잡아봐요"
      description="오늘 어떤 일이 있었는지, 편한 만큼만 남겨봐요."
    >
      <Link href="/journal/history">
        <SurfaceCard className="bg-[linear-gradient(135deg,#f5f0ff_0%,#ffffff_100%)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-accent">지난 기록 보기</p>
              <p className="mt-2 text-sm leading-6 text-muted">최근 감정 흐름을 한 번에 돌아봐요.</p>
            </div>
            <span className="rounded-full bg-primarySoft px-4 py-2 text-xs font-semibold text-accent">
              보기
            </span>
          </div>
        </SurfaceCard>
      </Link>
      <JournalEntryForm />
    </AppShell>
  );
}
