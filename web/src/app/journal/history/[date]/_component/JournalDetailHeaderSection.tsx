import type { JournalEntry } from "@/shared/lib/api";
import { formatKoreanDate, formatKoreanDateTime } from "@/shared/lib/date";

export function JournalDetailHeaderSection({
  date,
  entry,
  isFetching,
  isFromWrite,
  isValidDate
}: {
  date: string;
  entry?: JournalEntry | null;
  isFetching: boolean;
  isFromWrite: boolean;
  isValidDate: boolean;
}) {
  return (
    <section className="rounded-[2rem] bg-surfaceContainerLowest px-6 py-7 shadow-ambient">
      <p className="text-xs uppercase tracking-[0.2em] text-secondary/70">journal detail</p>
      <h2 className="mt-4 text-[1.85rem] leading-[1.35] text-onSurface">
        {isValidDate ? formatKoreanDate(date) : "기록을 확인할 수 없어요"}
      </h2>
      {isFromWrite ? (
        <p className="mt-3 text-sm leading-7 text-primary">방금 남긴 기록을 여기에서 다시 볼 수 있어요.</p>
      ) : null}
      {entry ? (
        <p className="mt-3 text-sm leading-7 text-onSurfaceVariant">
          {formatKoreanDateTime(entry.createdAt)}에 마지막으로 정리한 기록이에요.
        </p>
      ) : null}
      {isFetching ? (
        <p className="mt-3 text-xs tracking-[0.18em] text-onSurfaceVariant/70">기록을 다시 확인하고 있어요.</p>
      ) : null}
    </section>
  );
}
