"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useScreeningQuestionnaire } from "@/shared/hooks/useScreeningQuestionnaire";
import { useSubmitScreening } from "@/shared/hooks/useSubmitScreening";
import type { ScreeningQuestionnaire } from "@/shared/lib/api";
import { ScreeningQuestionActions } from "./ScreeningQuestionActions";
import { ScreeningQuestionSection } from "./ScreeningQuestionSection";

export function ScreeningQuestionsClient({
  initialQuestionnaire
}: {
  initialQuestionnaire?: ScreeningQuestionnaire | null;
}) {
  const router = useRouter();
  const { data: questionnaire } = useScreeningQuestionnaire(initialQuestionnaire);
  const submitScreening = useSubmitScreening(questionnaire);
  const items = useMemo(() => questionnaire?.sections.flatMap((section) => section.items) ?? [], [questionnaire]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const currentItem = items[currentIndex];
  const currentSectionTitle = questionnaire?.sections.find((section) => section.items.some((item) => item.id === currentItem?.id))?.title;
  const isLast = currentIndex === items.length - 1;
  const showPreviousButton = currentIndex > 0;
  const showTextActionButton = currentItem?.kind !== "single_choice";

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
    <div className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col overflow-x-hidden">
      <ScreeningQuestionSection
        answer={currentItem ? answers[currentItem.id] : undefined}
        currentIndex={currentIndex}
        currentItem={currentItem}
        currentSectionTitle={currentSectionTitle}
        itemCount={items.length}
        onSelectOption={(value) => void handleSelectOption(value)}
        onTextChange={(value) => currentItem && setAnswers((prev) => ({ ...prev, [currentItem.id]: value }))}
        questionnaireLoaded={Boolean(questionnaire)}
      />
      <ScreeningQuestionActions
        disabled={Boolean(submitScreening.isPending || (currentItem?.required && !answers[currentItem.id]))}
        isLast={isLast}
        isPending={submitScreening.isPending}
        onNext={() => void handleNext()}
        onPrevious={goToPrevious}
        showPreviousButton={showPreviousButton}
        showTextActionButton={showTextActionButton}
      />
    </div>
  );
}
