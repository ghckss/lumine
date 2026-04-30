"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useScreeningQuestionnaire } from "@/shared/hooks/useScreeningQuestionnaire";
import { useSubmitScreening } from "@/shared/hooks/useSubmitScreening";

export default function ScreeningQuestionsPage() {
  const router = useRouter();
  const { data: questionnaire } = useScreeningQuestionnaire();
  const submitScreening = useSubmitScreening();
  const items = useMemo(() => questionnaire?.sections.flatMap((section) => section.items) ?? [], [questionnaire]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const currentItem = items[currentIndex];
  const currentSectionTitle = questionnaire?.sections.find((section) => section.items.some((item) => item.id === currentItem?.id))?.title;
  const isLast = currentIndex === items.length - 1;

  function goToPrevious() {
    if (currentIndex > 0) {
      setCurrentIndex((value) => value - 1);
      return;
    }

    router.push("/screening/start");
  }

  async function handleNext() {
    if (!currentItem) {
      return;
    }

    if (currentItem.required && !answers[currentItem.id]) {
      return;
    }

    if (!isLast) {
      setCurrentIndex((value) => value + 1);
      return;
    }

    const result = await submitScreening.mutateAsync({ answers });
    router.push(result.requiresSafetyPrompt ? "/support?source=safety" : "/screening/result");
  }

  async function handleSelectOption(value: string) {
    if (!currentItem || submitScreening.isPending) {
      return;
    }

    const nextAnswers = { ...answers, [currentItem.id]: value };
    setAnswers(nextAnswers);

    if (!isLast) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    const result = await submitScreening.mutateAsync({ answers: nextAnswers });
    router.push(result.requiresSafetyPrompt ? "/support?source=safety" : "/screening/result");
  }

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-x-hidden bg-background">
      <div className="fixed left-0 top-16 z-40 h-[2px] w-full bg-surfaceContainerHigh">
        <div className="h-full bg-primary/30 transition-all" style={{ width: `${items.length > 0 ? ((currentIndex + 1) / items.length) * 100 : 0}%` }} />
      </div>

      <main className="flex flex-1 flex-col px-8 pb-32 pt-16">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <p className="text-sm tracking-[0.24em] text-secondary/70">{currentSectionTitle ?? "지금 마음"}</p>
          <h2 className="mb-6 mt-8 text-left text-4xl font-light leading-[1.6] tracking-widest text-primary">{currentItem?.title ?? "질문을 불러오고 있어요"}</h2>
          {currentItem?.description ? <p className="mb-10 text-sm leading-7 text-onSurfaceVariant">{currentItem.description}</p> : null}

          {!questionnaire && !currentItem ? (
            <p className="mb-10 text-sm leading-7 text-onSurfaceVariant">질문을 천천히 불러오고 있어요.</p>
          ) : null}

          {currentItem?.kind === "single_choice" ? (
            <div className="flex w-full flex-col items-start gap-6 pl-4">
              {currentItem.options.map((option, index) => {
                const widthClass = ["w-4/5 ml-auto", "w-3/4", "w-5/6 ml-4", "w-3/4 ml-auto"][index % 4];
                const active = answers[currentItem.id] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => void handleSelectOption(option.value)}
                    className={`${widthClass} flex items-center justify-center rounded-full px-8 py-5 text-left transition-all duration-500 ease-out ${active ? "bg-primary text-white shadow-moon" : "bg-surfaceContainerLowest text-primary hover:bg-surfaceContainerLow"}`}
                  >
                    <span className="text-lg font-medium tracking-wider">{option.label}</span>
                  </button>
                );
              })}
            </div>
          ) : currentItem ? (
            <textarea
              value={answers[currentItem.id] ?? ""}
              onChange={(event) => setAnswers((prev) => ({ ...prev, [currentItem.id]: event.target.value }))}
              className="min-h-56 w-full rounded-[28px] border border-outlineVariant/40 bg-surfaceContainerLowest px-6 py-5 text-base text-onSurface outline-none placeholder:text-onSurfaceVariant/70"
              placeholder="괜찮은 만큼만 적어도 돼요."
            />
          ) : null}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex max-w-md items-center justify-between bg-gradient-to-t from-background via-background/90 to-transparent px-8 pb-12 pt-8">
        <span className="text-sm tracking-widest text-onSurfaceVariant/60">
          {items.length > 0 ? `${String(currentIndex + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}` : "00 / 00"}
        </span>
        <div className="flex w-full max-w-[280px] justify-end gap-3">
          {currentIndex > 0 ? (
            <button
              type="button"
              onClick={goToPrevious}
              className="rounded-full bg-surfaceContainerLowest px-5 py-4 text-center text-sm font-medium tracking-widest text-primary transition-colors duration-500 ease-out hover:bg-surfaceContainerLow"
            >
              이전 질문
            </button>
          ) : null}
          {currentItem?.kind !== "single_choice" ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={submitScreening.isPending || (currentItem?.required && !answers[currentItem.id])}
              className="w-full max-w-[200px] rounded-full bg-secondaryContainer py-4 text-center text-sm font-medium tracking-widest text-tertiary transition-colors duration-500 ease-out hover:bg-tertiaryContainer disabled:opacity-50"
            >
              {isLast ? (submitScreening.isPending ? "정리하는 중" : "결과 보기") : "다음으로"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
