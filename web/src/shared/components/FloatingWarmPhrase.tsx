"use client";

import { useEffect, useState } from "react";
import { AppIcon } from "@/shared/components/AppIcon";

const warmPhrases = [
  "때로는 아무것도 하지 않는 것이 가장 큰 용기가 되기도 해요. 지금 이 순간만큼은 당신의 평온만을 생각하세요.",
  "당신이 걷는 모든 발걸음이 정답일 필요는 없어요. 잠시 멈춰 서서 바라보는 풍경도 당신의 삶이니까요.",
  "마음이 소란스러운 날에는 그냥 가만히 있어 보세요. 소란이 잦아들면 당신 안의 빛이 다시 보일 거예요.",
  "당신은 충분히 잘하고 있고, 앞으로도 그럴 거예요. 당신을 믿는 제가 늘 이곳에서 기다리고 있을게요.",
  "세상의 속도에 맞추지 않아도 괜찮아요. 당신에게는 당신만의 아름다운 계절이 있으니까요.",
  "지친 마음을 억지로 끌어올리지 마세요. 잠시 가라앉아 쉬는 것도 다시 떠오르기 위한 준비일 뿐이에요.",
  "완벽하지 않은 모습 그대로도 당신은 참 소중해요. 당신의 모든 조각들이 모여 지금의 빛을 만듭니다.",
  "당신의 진심은 언제나 빛나고 있어요. 비록 지금은 안개에 가려져 보이지 않더라도 사라진 건 아니에요.",
  "숨을 크게 한 번 들이마셔 보세요. 당신이 내쉬는 숨과 함께 걱정들도 조금씩 멀어지기를 바랍니다."
];

function getRandomPhrase(previousPhrase: string | null) {
  if (warmPhrases.length === 1) {
    return warmPhrases[0];
  }

  const candidates = warmPhrases.filter((phrase) => phrase !== previousPhrase);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function FloatingWarmPhrase() {
  const [phrase, setPhrase] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  function handleOpenPhrase() {
    setPhrase((currentPhrase) => getRandomPhrase(currentPhrase));
    setIsVisible(true);
  }

  useEffect(() => {
    if (!phrase || !isVisible) {
      return;
    }

    const fadeTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, 5000);
    const removeTimer = window.setTimeout(() => {
      setPhrase(null);
    }, 5300);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [phrase, isVisible]);

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-5 z-40 flex flex-col items-end gap-3">
      {phrase ? (
        <div
          className={`relative max-w-[min(20rem,calc(100vw-2.5rem))] rounded-[26px] bg-surfaceContainerLowest px-5 py-5 text-left shadow-moon ring-1 ring-primary/10 transition-all duration-300 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
        >
          <p className="text-sm leading-7 text-onSurface">{phrase}</p>
          <span className="absolute bottom-[-7px] right-8 h-4 w-4 rotate-45 bg-surfaceContainerLowest ring-1 ring-primary/10" />
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleOpenPhrase}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primaryContainer text-white shadow-moon transition-transform active:scale-95"
        aria-label="다정한 문구 보기"
      >
        <AppIcon name="auto-awesome" className="h-6 w-6" />
      </button>
    </div>
  );
}
