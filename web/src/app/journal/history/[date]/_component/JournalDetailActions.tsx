import Link from "next/link";

export function JournalDetailActions() {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link href="/journal/history" className="rounded-full bg-surfaceContainerLowest px-5 py-3 text-sm font-semibold text-secondary">
        목록으로 돌아가기
      </Link>
      <Link href="/journal" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">
        새 기록 남기기
      </Link>
    </div>
  );
}
