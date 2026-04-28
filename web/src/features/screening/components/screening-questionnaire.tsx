"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/shared/components/primary-button";
import { SurfaceCard } from "@/shared/components/surface-card";
import { useScreeningQuestionnaire } from "@/shared/hooks/use-screening-questionnaire";
import { useSubmitScreening } from "@/shared/hooks/use-submit-screening";
import { getTodayDate } from "@/shared/lib/date";
import { useScreeningStore } from "@/shared/store/screening-store";

export function ScreeningQuestionnaire() {
  const router = useRouter();
  const { data, isLoading } = useScreeningQuestionnaire();
  const submitScreening = useSubmitScreening();
  const { answers, setAnswer, setResult } = useScreeningStore();
  const [localNarrative, setLocalNarrative] = useState<Record<string, string>>({});

  const items = useMemo(() => data?.sections.flatMap((section) => section.items) ?? [], [data]);
  const currentIndex = items.findIndex((item) => item.required && !answers[item.id]);
  const activeIndex = currentIndex === -1 ? items.length - 1 : currentIndex;
  const activeItem = items[activeIndex];
  const answeredRequiredCount = items.filter((item) => item.required && answers[item.id]).length;
  const totalRequiredCount = items.filter((item) => item.required).length;

  if (isLoading || !data || !activeItem) {
    return <SurfaceCard>질문을 불러오고 있어요.</SurfaceCard>;
  }

  const progress = Math.round((answeredRequiredCount / totalRequiredCount) * 100);

  async function handleSubmit() {
    const result = await submitScreening.mutateAsync({ answers: { ...answers, ...localNarrative } });
    setResult(result.data, getTodayDate());
    router.push("/screening/result");
  }

  return (
    <div className="grid gap-4">
      <SurfaceCard>
        <p className="text-sm text-muted">{data.subtitle}</p>
        <h2 className="mt-2 text-2xl font-semibold">{data.title}</h2>
        <div className="mt-5 h-2 rounded-full bg-accentSoft">
          <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <p className="text-sm text-muted">
          {activeIndex + 1} / {items.length}
        </p>
        <h3 className="mt-2 text-xl font-semibold leading-8">{activeItem.title}</h3>
        {activeItem.description ? (
          <p className="mt-3 text-sm leading-6 text-muted">{activeItem.description}</p>
        ) : null}

        {activeItem.kind === "single_choice" ? (
          <div className="mt-6 grid gap-3">
            {activeItem.options?.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setAnswer(activeItem.id, option.value)}
                className={`rounded-[20px] border px-4 py-4 text-left transition ${answers[activeItem.id] === option.value
                    ? "border-accent bg-primarySoft shadow-[0_10px_20px_rgba(98,76,187,0.12)]"
                    : "border-line bg-white/80 hover:border-accent"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            <textarea
              value={localNarrative[activeItem.id] ?? ""}
              onChange={(event) =>
                setLocalNarrative((current) => ({ ...current, [activeItem.id]: event.target.value }))
              }
              className="min-h-40 w-full rounded-[20px] border border-line bg-white/80 px-4 py-4 text-base outline-none"
              placeholder="괜찮은 만큼만 적어도 돼요"
            />
          </div>
        )}
      </SurfaceCard>

      <div className="flex items-center justify-between gap-3">
        <Link href="/screening/start" className="text-sm text-muted underline underline-offset-4">
          시작 화면으로 돌아가기
        </Link>
        <PrimaryButton
          type="button"
          onClick={handleSubmit}
          disabled={answeredRequiredCount !== totalRequiredCount || submitScreening.isPending}
        >
          {submitScreening.isPending ? "정리하고 있어요" : "결과 보기"}
        </PrimaryButton>
      </div>
    </div>
  );
}
