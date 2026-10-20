import type { CSSProperties } from "react";
import { emotionColors, type Emotion } from "@/lib/Constants";

export function EmotionChip({ emotion }: { emotion: Emotion }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-bold text-[#211934]"
      style={
        {
          background: `color-mix(in srgb, ${emotionColors[emotion]} 19%, white)`,
          borderColor: `color-mix(in srgb, ${emotionColors[emotion]} 48%, white)`,
        } as CSSProperties
      }
    >
      <i className="size-[7px] rounded-full" style={{ background: emotionColors[emotion] }} />
      {emotion}
    </span>
  );
}
