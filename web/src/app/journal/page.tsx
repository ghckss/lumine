"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSaveJournalEntry } from "@/shared/hooks/useSaveJournalEntry";
import { formatKoreanDate, getTodayDate } from "@/shared/lib/date";

const positiveEmotionOptions = ["차분함", "안도감", "기쁨", "즐거움", "행복", "고마움", "편안함", "설렘"];
const heavyEmotionOptions = ["지침", "답답함", "무거움", "불안함", "서운함", "외로움", "분노", "괴로움"];

function SurfaceCard({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`rounded-[28px] bg-surfaceContainerLowest px-5 py-5 shadow-ambient ${className}`}>{children}</section>;
}

function EmotionChip({
  label,
  selected,
  tone,
  onClick
}: {
  label: string;
  selected: boolean;
  tone: "primary" | "secondary";
  onClick: () => void;
}) {
  const activeClass = tone === "primary" ? "bg-primary text-white" : "bg-secondary text-white";
  const idleClass = "border border-outlineVariant/40 bg-surfaceContainerLowest text-onSurface";

  return (
    <button type="button" onClick={onClick} className={`rounded-full px-4 py-2 text-sm transition ${selected ? activeClass : idleClass}`}>
      {label}
    </button>
  );
}

export default function JournalPage() {
  const router = useRouter();
  const today = useMemo(() => getTodayDate(), []);
  const saveJournalEntry = useSaveJournalEntry();
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [customEmotion, setCustomEmotion] = useState("");
  const [body, setBody] = useState("");
  const [comfortOverlay, setComfortOverlay] = useState<string | null>(null);

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
    if (selectedEmotions.length !== 3 || saveJournalEntry.isPending) {
      return;
    }

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
      router.replace("/");
    }, 1200);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-8 px-5 py-6 sm:px-6 sm:py-8">
      {comfortOverlay ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 px-6 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] bg-surfaceContainerLowest px-6 py-8 text-center shadow-moon">
            <p className="text-[1.3rem] leading-[1.7] text-onSurface">{comfortOverlay}</p>
          </div>
        </div>
      ) : null}

      <header className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary)_88%,black),color-mix(in_srgb,var(--color-primary)_62%,var(--color-on-primary-container))_100%)] px-6 py-7 text-white shadow-moon sm:px-7 sm:py-8">
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0))]" />
        <div className="absolute right-[-24px] top-[-24px] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),rgba(255,255,255,0.02)_68%)]" />

        <div className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[11px] font-medium tracking-[0.18em] text-white/84 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
          TODAY LOG
        </div>

        <div className="relative z-10 mt-6 max-w-[31rem]">
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">Lumine</p>
          <h1 className="mt-3 text-[2.15rem] leading-[1.18] text-white sm:text-[2.35rem]">
            오늘 오래 남은 장면을
            <br />
            천천히 적어봐요
          </h1>
          <p className="mt-4 max-w-[28rem] text-sm leading-7 text-white/76">
            감정 세 가지와 오늘 있었던 일을 남겨두면, 나중에 흐름을 다시 보기 쉬워져요.
          </p>
        </div>
      </header>

      <Link href="/journal/history">
        <SurfaceCard className="transition hover:-translate-y-0.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-secondary/70">archive</p>
              <p className="mt-2 text-[1.3rem] leading-8 text-onSurface">지난 기록을 다시 볼 수 있어요</p>
              <p className="mt-2 text-sm leading-7 text-onSurfaceVariant">최근 감정 흐름을 한 번에 돌아봐요.</p>
            </div>
            <span className="rounded-full bg-secondaryContainer px-4 py-2 text-xs font-semibold text-secondary">보기</span>
          </div>
        </SurfaceCard>
      </Link>

      <SurfaceCard>
        <p className="text-sm text-onSurfaceVariant">{formatKoreanDate(today)}</p>
        <h2 className="mt-3 text-[1.75rem] leading-[1.45] text-onSurface">오늘 감정 세 가지를 골라볼까요</h2>

        <div className="mt-5 grid gap-5">
          <div>
            <p className="text-sm font-medium text-onSurface">가벼운 기분</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {positiveEmotionOptions.map((emotion) => (
                <EmotionChip
                  key={emotion}
                  label={emotion}
                  selected={selectedEmotions.includes(emotion)}
                  tone="primary"
                  onClick={() => toggleEmotion(emotion)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-onSurface">무거운 기분</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {heavyEmotionOptions.map((emotion) => (
                <EmotionChip
                  key={emotion}
                  label={emotion}
                  selected={selectedEmotions.includes(emotion)}
                  tone="secondary"
                  onClick={() => toggleEmotion(emotion)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <input
            type="text"
            value={customEmotion}
            onChange={(event) => setCustomEmotion(event.target.value)}
            className="flex-1 rounded-full border border-outlineVariant/40 bg-surfaceContainerLow px-4 py-3 text-sm outline-none"
            placeholder="감정을 직접 적어도 괜찮아요"
          />
          <button
            type="button"
            onClick={handleAddCustomEmotion}
            disabled={!customEmotion.trim() || selectedEmotions.length >= 3}
            className="rounded-full bg-surfaceContainerLow px-4 py-3 text-sm font-semibold text-onSurface disabled:opacity-50"
          >
            추가
          </button>
        </div>

        {customSelectedEmotions.length > 0 ? (
          <div className="mt-4">
            <p className="text-sm font-medium text-onSurface">직접 적은 감정</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {customSelectedEmotions.map((emotion) => (
                <button
                  key={emotion}
                  type="button"
                  onClick={() => toggleEmotion(emotion)}
                  className="rounded-full bg-tertiaryContainer px-4 py-2 text-sm text-onSurface"
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-4 text-sm leading-7 text-onSurfaceVariant">긍정적인 감정도 괜찮고, 직접 적어도 괜찮아요. 세 개까지 고를 수 있어요.</p>
      </SurfaceCard>

      <SurfaceCard>
        <h3 className="text-[1.55rem] leading-[1.45] text-onSurface">오늘 있었던 일을 남겨봐요</h3>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="mt-5 min-h-56 w-full rounded-[24px] border border-outlineVariant/30 bg-surfaceContainerLow px-4 py-4 text-base outline-none placeholder:text-onSurfaceVariant/70"
          placeholder="오늘은 어떤 일이 있으셨나요? 저에게만 알려주세요."
        />
      </SurfaceCard>

      <button
        type="button"
        onClick={handleSave}
        disabled={selectedEmotions.length !== 3 || saveJournalEntry.isPending}
        className="flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-primaryContainer px-5 text-sm font-semibold text-white shadow-moon disabled:opacity-50"
      >
        {saveJournalEntry.isPending ? "저장하고 있어요" : "오늘 기록 남기기"}
      </button>
    </main>
  );
}
