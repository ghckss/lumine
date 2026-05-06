import Link from "next/link";
import type { JournalEntry } from "@/shared/lib/api";
import { formatKoreanDate } from "@/shared/lib/date";

const positiveEmotions = new Set(["차분함", "안도감", "기쁨", "즐거움", "행복", "고마움", "편안함", "설렘", "평온함"]);

function getEmotionTone(label: string) {
  return positiveEmotions.has(label)
    ? { textClass: "text-primary", bgClass: "bg-primaryFixed" }
    : { textClass: "text-secondary", bgClass: "bg-secondaryContainer" };
}

export function JournalHistoryListSection({ entries }: { entries: JournalEntry[] }) {
  return (
    <section className="flex flex-col gap-8">
      {entries.length === 0 ? (
        <section className="rounded-[1.5rem] bg-surfaceContainerLowest p-8 shadow-ambient">
          <p className="text-base leading-8 text-onSurface">아직 남겨진 기록이 없어요.</p>
          <p className="mt-3 text-sm leading-7 text-onSurfaceVariant">첫 기록을 남기면 감정의 흐름을 여기에서 다시 펼쳐볼 수 있어요.</p>
          <div className="mt-6 flex justify-end">
            <Link href="/screening/start" className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">
              심리 검사하러 가기
            </Link>
          </div>
        </section>
      ) : null}

      {entries.map((entry) => {
        const leadEmotion = entry.emotions[0]?.label ?? "기록";
        const { textClass, bgClass } = getEmotionTone(leadEmotion);

        return (
          <Link key={`${entry.date}-${entry.createdAt}`} href={`/journal/history/${entry.date}`} className="block">
            <article className="group flex flex-col gap-5 rounded-[1.5rem] bg-surfaceContainerLowest p-8 transition-all duration-500 hover:shadow-moon">
              <header className="flex items-center justify-between">
                <time className="text-sm tracking-widest text-onSurfaceVariant/70">{formatKoreanDate(entry.date)}</time>
                <div className={`rounded-full px-3 py-1 text-xs tracking-wider transition-colors duration-300 ${textClass} ${bgClass}`}>
                  {leadEmotion}
                </div>
              </header>
              <div className="h-px w-12 bg-primary/10" />
              <p className="line-clamp-2 text-base leading-[1.8] tracking-wide text-onSurface">{entry.body}</p>
            </article>
          </Link>
        );
      })}
    </section>
  );
}
