import type { JournalEntry } from "@/shared/lib/api";

export function JournalDetailContentSections({ entry }: { entry: JournalEntry }) {
  return (
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
  );
}
