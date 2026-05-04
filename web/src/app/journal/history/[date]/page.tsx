"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useJournalEntry } from "@/shared/hooks/useJournalEntry";
import { formatKoreanDate, formatKoreanDateTime } from "@/shared/lib/date";

function isValidDateParam(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export default function JournalHistoryDetailPage() {
  const params = useParams<{ date: string }>();
  const searchParams = useSearchParams();
  const date = typeof params.date === "string" ? params.date : "";
  const isValidDate = isValidDateParam(date);
  const source = searchParams.get("source");
  const isFromWrite = source === "write";
  const { data: entry, isFetching } = useJournalEntry(date, {
    enabled: isValidDate,
    refetchOnMount: "always"
  });

  return (
    <div className="min-h-screen text-onSurface">
      <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-6 pb-32 pt-8">
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

        {!isValidDate ? (
          <section className="rounded-[1.5rem] bg-surfaceContainerLowest p-8 shadow-ambient">
            <p className="text-base leading-8 text-onSurface">올바른 기록 날짜가 아니에요.</p>
          </section>
        ) : null}

        {isValidDate && !entry && !isFetching ? (
          <section className="rounded-[1.5rem] bg-surfaceContainerLowest p-8 shadow-ambient">
            <p className="text-base leading-8 text-onSurface">해당 날짜의 기록을 찾지 못했어요.</p>
            <p className="mt-3 text-sm leading-7 text-onSurfaceVariant">기록을 남기지 않은 날이거나 아직 불러오지 못한 상태일 수 있어요.</p>
          </section>
        ) : null}

        {entry ? (
          <>
            <section className="rounded-[1.5rem] bg-surfaceContainerLowest p-8 shadow-ambient">
              <p className="text-sm font-medium tracking-[0.18em] text-secondary/70">그날 머문 감정</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {entry.emotions.map((emotion, index) => (
                  <span
                    key={`${emotion.id}-${index}`}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      index === 0
                        ? "bg-primaryFixed text-primary"
                        : index === 1
                          ? "bg-secondaryContainer text-secondary"
                          : "bg-surfaceContainer text-onSurfaceVariant"
                    }`}
                  >
                    {emotion.label}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-[1.5rem] bg-surfaceContainerLowest p-8 shadow-ambient">
              <p className="text-sm font-medium tracking-[0.18em] text-secondary/70">남겨둔 이야기</p>
              <p className="mt-5 whitespace-pre-wrap text-base leading-[1.95] text-onSurface">{entry.body}</p>
            </section>

            <section className="rounded-[1.5rem] bg-[linear-gradient(180deg,var(--color-surface-container-lowest)_0%,var(--color-secondary-container)_100%)] p-8 shadow-moon">
              <p className="text-sm font-medium tracking-[0.18em] text-secondary/70">그날의 다정한 문장</p>
              <p className="mt-5 text-base leading-[1.95] text-onSurface">{entry.comfortMessage}</p>
            </section>

          </>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <Link href="/journal/history" className="rounded-full bg-surfaceContainerLowest px-5 py-3 text-sm font-semibold text-secondary">
            목록으로 돌아가기
          </Link>
          <Link href="/journal" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">
            새 기록 남기기
          </Link>
        </div>
      </main>
    </div>
  );
}
