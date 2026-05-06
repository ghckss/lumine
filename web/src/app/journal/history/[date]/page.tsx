"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useJournalEntry } from "@/shared/hooks/useJournalEntry";
import { JournalDetailActions } from "./_component/JournalDetailActions";
import { JournalDetailContentSections } from "./_component/JournalDetailContentSections";
import { JournalDetailHeaderSection } from "./_component/JournalDetailHeaderSection";
import { JournalDetailStateSection } from "./_component/JournalDetailStateSection";

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
        <JournalDetailHeaderSection
          date={date}
          entry={entry}
          isFetching={isFetching}
          isFromWrite={isFromWrite}
          isValidDate={isValidDate}
        />

        {!isValidDate ? (
          <JournalDetailStateSection title="올바른 기록 날짜가 아니에요." />
        ) : null}

        {isValidDate && !entry && !isFetching ? (
          <JournalDetailStateSection
            title="해당 날짜의 기록을 찾지 못했어요."
            description="기록을 남기지 않은 날이거나 아직 불러오지 못한 상태일 수 있어요."
          />
        ) : null}

        {entry ? <JournalDetailContentSections entry={entry} /> : null}
        <JournalDetailActions />
      </main>
    </div>
  );
}
