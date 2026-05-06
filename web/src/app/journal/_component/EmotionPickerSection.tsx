"use client";

import { formatKoreanDate } from "@/shared/lib/date";

export const positiveEmotionOptions = ["차분함", "안도감", "기쁨", "즐거움", "행복", "고마움", "편안함", "설렘"];
export const heavyEmotionOptions = ["지침", "답답함", "무거움", "불안함", "서운함", "외로움", "분노", "괴로움"];

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

export function EmotionPickerSection({
  customEmotion,
  customSelectedEmotions,
  onAddCustomEmotion,
  onCustomEmotionChange,
  onToggleEmotion,
  selectedEmotions,
  today
}: {
  customEmotion: string;
  customSelectedEmotions: string[];
  onAddCustomEmotion: () => void;
  onCustomEmotionChange: (value: string) => void;
  onToggleEmotion: (emotion: string) => void;
  selectedEmotions: string[];
  today: string;
}) {
  return (
    <SurfaceCard>
      <p className="text-sm text-onSurfaceVariant">{formatKoreanDate(today)}</p>
      <h2 className="mt-3 text-[1.75rem] leading-[1.45] text-onSurface">오늘 감정을 골라볼까요</h2>

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
                onClick={() => onToggleEmotion(emotion)}
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
                onClick={() => onToggleEmotion(emotion)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <input
          type="text"
          value={customEmotion}
          onChange={(event) => onCustomEmotionChange(event.target.value)}
          className="flex-1 rounded-full border border-outlineVariant/40 bg-surfaceContainerLow px-4 py-3 text-sm outline-none"
          placeholder="감정을 직접 적어도 괜찮아요"
        />
        <button
          type="button"
          onClick={onAddCustomEmotion}
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
                onClick={() => onToggleEmotion(emotion)}
                className="rounded-full bg-tertiaryContainer px-4 py-2 text-sm text-onSurface"
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-4 text-sm leading-7 text-onSurfaceVariant">하나만 골라도 괜찮고, 긍정적인 감정이나 직접 적은 감정도 괜찮아요. 세 개까지 고를 수 있어요.</p>
    </SurfaceCard>
  );
}
