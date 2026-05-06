import type { ScreeningQuestionItem } from "@/shared/lib/api";

export function ScreeningQuestionSection({
  answer,
  currentIndex,
  currentItem,
  currentSectionTitle,
  itemCount,
  onSelectOption,
  onTextChange,
  questionnaireLoaded
}: {
  answer?: string;
  currentIndex: number;
  currentItem?: ScreeningQuestionItem;
  currentSectionTitle?: string;
  itemCount: number;
  onSelectOption: (value: string) => void;
  onTextChange: (value: string) => void;
  questionnaireLoaded: boolean;
}) {
  return (
    <main className="flex flex-1 flex-col px-8 pb-32 pt-16">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm tracking-[0.24em] text-secondary/70">{currentSectionTitle ?? "지금 마음"}</p>
          <span className="pt-0.5 text-sm tracking-widest text-onSurfaceVariant/60">
            {itemCount > 0 ? `${String(currentIndex + 1).padStart(2, "0")} / ${String(itemCount).padStart(2, "0")}` : "00 / 00"}
          </span>
        </div>
        <h2 className="mb-6 mt-8 text-left text-4xl font-light leading-[1.6] tracking-widest text-primary">
          {currentItem?.title ?? "질문을 불러오고 있어요"}
        </h2>
        {currentItem?.description ? <p className="mb-10 text-sm leading-7 text-onSurfaceVariant">{currentItem.description}</p> : null}

        {!questionnaireLoaded && !currentItem ? (
          <p className="mb-10 text-sm leading-7 text-onSurfaceVariant">질문을 천천히 불러오고 있어요.</p>
        ) : null}

        {currentItem?.kind === "single_choice" ? (
          <div className="flex w-full flex-col items-start gap-6 pl-4">
            {currentItem.options.map((option, index) => {
              const widthClass = ["w-4/5 ml-auto", "w-3/4", "w-5/6 ml-4", "w-3/4 ml-auto"][index % 4];
              const active = answer === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSelectOption(option.value)}
                  className={`${widthClass} flex items-center justify-center rounded-full px-8 py-5 text-left transition-all duration-500 ease-out ${active ? "bg-primary text-white shadow-moon" : "bg-surfaceContainerLowest text-primary hover:bg-surfaceContainerLow"}`}
                >
                  <span className="text-lg font-medium tracking-wider">{option.label}</span>
                </button>
              );
            })}
          </div>
        ) : currentItem ? (
          <textarea
            value={answer ?? ""}
            onChange={(event) => onTextChange(event.target.value)}
            className="min-h-56 w-full rounded-[28px] border border-outlineVariant/40 bg-surfaceContainerLowest px-6 py-5 text-base text-onSurface outline-none placeholder:text-onSurfaceVariant/70"
            placeholder="오늘 있었던 일을 알려주세요."
          />
        ) : null}
      </div>
    </main>
  );
}
