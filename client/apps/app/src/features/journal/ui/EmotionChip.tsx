import React from "react";
import { EmotionChip as SharedEmotionChip } from "../../../shared/ui/NativeUI";

export function EmotionChip(props: React.ComponentProps<typeof SharedEmotionChip>) {
  return <SharedEmotionChip {...props} />;
}
