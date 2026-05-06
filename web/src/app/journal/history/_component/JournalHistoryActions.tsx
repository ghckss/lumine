import Link from "next/link";

export function JournalHistoryActions() {
  return (
    <div className="flex justify-end">
      <Link href="/journal" className="rounded-full bg-primary px-6 py-3 text-sm text-white">
        새 기록 남기기
      </Link>
    </div>
  );
}
