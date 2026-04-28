"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/shared/components/primary-button";
import { SurfaceCard } from "@/shared/components/surface-card";
import { useSaveJournalEntry } from "@/shared/hooks/use-save-journal-entry";
import { formatKoreanDate, getTodayDate } from "@/shared/lib/date";
import { useJournalStore } from "@/shared/store/journal-store";

const positiveEmotionOptions = ["차분함", "안도감", "기쁨", "즐거움", "행복", "고마움", "편안함", "설렘"];
const heavyEmotionOptions = ["지침", "답답함", "무거움", "불안함", "서운함", "외로움", "분노", "괴로움"];

export function JournalEntryForm() {
  const router = useRouter();
  const today = useMemo(() => getTodayDate(), []);
  const saveJournalEntry = useSaveJournalEntry();
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [comfortOverlay, setComfortOverlay] = useState<string | null>(null);
  const [customEmotion, setCustomEmotion] = useState("");
  const { selectedEmotions, body, setSelectedEmotions, setBody } = useJournalStore();
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

  async function handleSave() {
    const start = Date.now();
    setComfortOverlay("오늘 마음을 남겨줘서 고마워요. 천천히 정리해볼게요.");

    const result = await saveJournalEntry.mutateAsync({
      date: today,
      emotions: selectedEmotions,
      body
    });

    const elapsed = Date.now() - start;
    if (elapsed < 1000) {
      await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
    }

    setComfortOverlay(result.data.comfortMessage);
    setSavedMessage(result.data.comfortMessage);

    window.setTimeout(() => {
      setComfortOverlay(null);
      router.replace("/");
    }, 1200);
  }

  return (
    <div className="relative grid gap-4">
      {comfortOverlay ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[28px] bg-[rgba(255,251,255,0.78)] p-8 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.4),0_30px_90px_rgba(91,73,154,0.22)] backdrop-blur-xl">
          <div className="rounded-[26px] bg-white/60 px-6 py-8 shadow-[0_0_40px_var(--color-glow)]">
            <p className="max-w-sm text-lg font-semibold leading-8">{comfortOverlay}</p>
          </div>
        </div>
      ) : null}

      <SurfaceCard>
        <p className="text-sm text-muted">{formatKoreanDate(today)}</p>
        <h2 className="mt-2 text-2xl font-semibold">오늘 감정 세 가지를 골라볼까요</h2>
        <div className="mt-5 grid gap-4">
          <div>
            <p className="text-sm font-medium text-text">가벼운 기분</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {positiveEmotionOptions.map((emotion) => {
                const selected = selectedEmotions.includes(emotion);
                return (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => toggleEmotion(emotion)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      selected
                        ? "bg-accent text-white shadow-[0_10px_20px_rgba(98,76,187,0.18)]"
                        : "border border-line bg-[#f8f5ff] text-text"
                    }`}
                  >
                    {emotion}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-text">무거운 기분</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {heavyEmotionOptions.map((emotion) => {
                const selected = selectedEmotions.includes(emotion);
                return (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => toggleEmotion(emotion)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      selected
                        ? "bg-accent text-white shadow-[0_10px_20px_rgba(98,76,187,0.18)]"
                        : "border border-line bg-white/80 text-text"
                    }`}
                  >
                    {emotion}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <input
            type="text"
            value={customEmotion}
            onChange={(event) => setCustomEmotion(event.target.value)}
            className="flex-1 rounded-full border border-line bg-white/80 px-4 py-3 text-sm outline-none"
            placeholder="감정을 직접 적어도 괜찮아요"
          />
          <button
            type="button"
            onClick={handleAddCustomEmotion}
            disabled={!customEmotion.trim() || selectedEmotions.length >= 3}
            className="rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-text disabled:opacity-50"
          >
            추가
          </button>
        </div>
        {customSelectedEmotions.length > 0 ? (
          <div className="mt-4">
            <p className="text-sm font-medium text-text">직접 적은 감정</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {customSelectedEmotions.map((emotion) => (
                <button
                  key={emotion}
                  type="button"
                  onClick={() => toggleEmotion(emotion)}
                  className="rounded-full border border-dashed border-accent bg-primarySoft px-4 py-2 text-sm text-accent"
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <p className="mt-3 text-sm text-muted">긍정적인 감정도 괜찮고, 직접 적어도 괜찮아요. 세 개까지 고를 수 있어요.</p>
      </SurfaceCard>

      <SurfaceCard>
        <h3 className="text-xl font-semibold">오늘 있었던 일을 남겨봐요</h3>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="mt-5 min-h-56 w-full rounded-[20px] border border-line bg-white/80 px-4 py-4 text-base outline-none"
          placeholder="오늘은 어떤 일이 있으셨나요? 저에게만 알려주세요."
        />
      </SurfaceCard>

      {savedMessage ? (
        <SurfaceCard>
          <p className="text-sm text-muted">오늘 기록 완료</p>
          <p className="mt-2 text-base leading-7">{savedMessage}</p>
        </SurfaceCard>
      ) : null}

      <PrimaryButton
        type="button"
        disabled={selectedEmotions.length !== 3 || saveJournalEntry.isPending}
        onClick={handleSave}
        className="w-full"
      >
        {saveJournalEntry.isPending ? "저장하고 있어요" : "오늘 기록 남기기"}
      </PrimaryButton>
    </div>
  );
}
