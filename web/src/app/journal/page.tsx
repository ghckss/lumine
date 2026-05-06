"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSaveJournalEntry } from "@/shared/hooks/useSaveJournalEntry";
import { getTodayDate } from "@/shared/lib/date";
import { ComfortOverlay } from "./_component/ComfortOverlay";
import {
  EmotionPickerSection,
  heavyEmotionOptions,
  positiveEmotionOptions
} from "./_component/EmotionPickerSection";
import { JournalArchiveLinkSection } from "./_component/JournalArchiveLinkSection";
import { JournalBodySection } from "./_component/JournalBodySection";
import { JournalHeroSection } from "./_component/JournalHeroSection";
import { JournalSubmitButton } from "./_component/JournalSubmitButton";

export default function JournalPage() {
  const router = useRouter();
  const today = useMemo(() => getTodayDate(), []);
  const saveJournalEntry = useSaveJournalEntry();
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [customEmotion, setCustomEmotion] = useState("");
  const [body, setBody] = useState("");
  const [comfortOverlay, setComfortOverlay] = useState<string | null>(null);
  const [bodyNotice, setBodyNotice] = useState<string | null>(null);

  const customSelectedEmotions = selectedEmotions.filter(
    (emotion) => !positiveEmotionOptions.includes(emotion) && !heavyEmotionOptions.includes(emotion)
  );

  function toggleEmotion(emotion: string) {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter((item) => item !== emotion));
      return;
    }

    if (selectedEmotions.length >= 3) {
      return;
    }

    setSelectedEmotions([...selectedEmotions, emotion]);
  }

  function handleAddCustomEmotion() {
    const trimmedEmotion = customEmotion.trim();

    if (!trimmedEmotion || selectedEmotions.includes(trimmedEmotion) || selectedEmotions.length >= 3) {
      return;
    }

    setSelectedEmotions([...selectedEmotions, trimmedEmotion]);
    setCustomEmotion("");
  }

  function handleBodyChange(value: string) {
    setBody(value);
    if (value.trim()) {
      setBodyNotice(null);
    }
  }

  async function handleSave() {
    if (selectedEmotions.length < 1 || saveJournalEntry.isPending) {
      return;
    }

    if (!body.trim()) {
      setBodyNotice("오늘 있었던 일을 적어주세요.");
      return;
    }

    setBodyNotice(null);
    const start = Date.now();
    setComfortOverlay("오늘 마음을 조용히 담아둘게요.");

    const result = await saveJournalEntry.mutateAsync({
      date: today,
      emotions: selectedEmotions,
      body
    });

    const elapsed = Date.now() - start;
    if (elapsed < 1000) {
      await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
    }

    setComfortOverlay(result.comfortMessage);

    window.setTimeout(() => {
      setComfortOverlay(null);
      router.replace(`/journal/history/${result.date}?source=write`);
    }, 1200);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-8 px-5 py-6 sm:px-6 sm:py-8">
      <ComfortOverlay message={comfortOverlay} />
      <JournalHeroSection />
      <JournalArchiveLinkSection />
      <EmotionPickerSection
        customEmotion={customEmotion}
        customSelectedEmotions={customSelectedEmotions}
        onAddCustomEmotion={handleAddCustomEmotion}
        onCustomEmotionChange={setCustomEmotion}
        onToggleEmotion={toggleEmotion}
        selectedEmotions={selectedEmotions}
        today={today}
      />
      <JournalBodySection
        body={body}
        bodyNotice={bodyNotice}
        onBodyChange={handleBodyChange}
      />
      <JournalSubmitButton
        disabled={selectedEmotions.length < 1 || !body.trim() || saveJournalEntry.isPending}
        isPending={saveJournalEntry.isPending}
        onClick={() => void handleSave()}
      />
    </main>
  );
}
