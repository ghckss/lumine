"use client";

import Link from "next/link";
import { useJournalEntry } from "@/shared/hooks/useJournalEntry";
import { useJournalHistory } from "@/shared/hooks/useJournalHistory";
import { useScreeningHistory } from "@/shared/hooks/useScreeningHistory";
import { getTodayDate } from "@/shared/lib/date";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    index: "01",
    title: "오늘의 마음을 가볍게 살펴봐요",
    body: "짧은 문항으로 지금 결을 먼저 보고 넘어가요."
  },
  {
    index: "02",
    title: "하루에 남은 장면을 적어봐요",
    body: "감정 세 가지와 오늘 있었던 일을 편하게 남겨봐요."
  },
  {
    index: "03",
    title: "마음이 무거운 날엔, 기댈 수 있는 곳을 준비했어요",
    body: "혼자 버티기 어려운 순간을 위해 바로 닿을 수 있는 연결을 남겨뒀어요."
  }
];

const reflections = [
  "오늘은 아직 아무것도 남기지 않아도 괜찮아요.",
  "한 걸음 남긴 날이면 그걸로 충분해요.",
  "오늘 필요한 기록은 이미 충분히 남겨졌어요."
];

function SurfaceCard({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`rounded-[28px] bg-surfaceContainerLowest px-5 py-5 shadow-ambient ${className}`}>{children}</section>;
}

function PrimaryButton({
  href,
  children,
  secondary = false
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        secondary
          ? "flex h-14 w-full items-center justify-center rounded-full bg-secondaryContainer px-5 text-sm font-semibold text-secondary"
          : "flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-primaryContainer px-5 text-sm font-semibold text-white shadow-moon"
      }
    >
      {children}
    </Link>
  );
}

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
};

export default function HomePage() {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const rippleIdRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  const [ripples, setRipples] = useState<Ripple[]>([]);

  const today = getTodayDate();
  const { data: todayJournalEntry } = useJournalEntry(today);
  const { data: journalHistory } = useJournalHistory(10);
  const { data: screeningHistory } = useScreeningHistory();

  const hasCompletedScreeningToday = screeningHistory?.[0]?.completedDate === today;
  const hasCompletedJournalToday = Boolean(todayJournalEntry);
  const completedCount = Number(hasCompletedScreeningToday) + Number(hasCompletedJournalToday);
  const reflection = reflections[completedCount];
  const moodPreview = todayJournalEntry?.emotions.map((emotion) => emotion.label)
    ?? journalHistory?.flatMap((entry) => entry.emotions.map((emotion) => emotion.label)).slice(0, 3)
    ?? [];

  useEffect(() => {
    const createRippleGroup = () => {
      const area = areaRef.current;
      if (!area) return;

      const { width, height } = area.getBoundingClientRect();

      const x = Math.random() * width;
      const y = Math.random() * height;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(width - x, y),
        Math.hypot(x, height - y),
        Math.hypot(width - x, height - y),
      );

      const size = maxDistance * 2;
      const count = Math.random() > 0.5 ? 2 : 1;

      const nextRipples: Ripple[] = Array.from({ length: count }, (_, index) => ({
        id: rippleIdRef.current++,
        x,
        y,
        size,
        delay: index * 0.2,
      }));

      setRipples((prev) => [...prev, ...nextRipples]);

      // 애니메이션이 끝난 ripple 제거
      window.setTimeout(() => {
        setRipples((prev) =>
          prev.filter((ripple) => !nextRipples.some((next) => next.id === ripple.id)),
        );
      }, 5400);

      // 다음 랜덤 좌표 실행 간격
      const nextDelay = 5000 + Math.random() * 1800;
      timeoutRef.current = window.setTimeout(createRippleGroup, nextDelay);
    };

    createRippleGroup();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col gap-4 px-5 py-6 sm:px-6 sm:py-8">
      <header ref={areaRef} className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary)_88%,black),color-mix(in_srgb,var(--color-primary)_62%,var(--color-on-primary-container))_100%)] px-6 py-7 text-white shadow-moon sm:px-7 sm:py-8">
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0))]" />
        <div className="absolute right-[-24px] top-[-24px] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),rgba(255,255,255,0.02)_68%)]" />
        <div className="absolute bottom-[-40px] left-[-16px] h-24 w-56 rounded-t-[999px] bg-white/5 blur-2xl" />

        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full border-[5px] order-primaryFixed/70 bg-primaryFixed/20 bg-transparent"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              animation: `ripple 5s linear ${ripple.delay}s both`,
              transform: "translate(-50%, -50%) scale(0)",

            }}
          />
        ))}

        <div className="relative z-10 mt-6 max-w-[31rem]">
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">Lumine</p>
          <h1 className="mt-3 text-[2rem] leading-[1.18] text-white">
            오늘 당신의 마음의 수면에
            <br />
            어떤 아름다운 빛이 머무르고 있나요?
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/80 text-right">
            오늘 당신의 하루를 닮은,<br />
            가장 솔직한 조각들을 가만히 들여보세요.
          </p>
        </div>
      </header>

      <div className="grid gap-4">
        {!hasCompletedScreeningToday ? <PrimaryButton href="/screening/start">나를 돌아보기</PrimaryButton> : null}
        {!hasCompletedJournalToday ? <PrimaryButton href="/journal" secondary>감정 일기 쓰기</PrimaryButton> : null}

        <section className="grid gap-3">
          {steps.map((step) => (
            <SurfaceCard key={step.index} className="bg-surfaceContainerLowest">
              <div className="grid grid-cols-[52px_1fr] gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primaryFixed text-xs font-semibold tracking-[0.16em] text-primary">
                  {step.index}
                </div>
                <div>
                  <p className="text-[1.2rem] leading-8 text-onSurface">{step.title}</p>
                  <p className="mt-2 text-sm leading-7 text-onSurfaceVariant">{step.body}</p>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </section>
      </div>

      <section className="grid gap-4 pb-8">
        <SurfaceCard className="bg-surfaceContainerLowest">
          <h2 className="mt-3 mb-3 text-[1.8rem] leading-[1.3] text-onSurface">오늘도 고생했어요</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <SurfaceCard className="border border-outlineVariant/70 bg-[linear-gradient(180deg,var(--color-surface-container-lowest)_0%,var(--color-secondary-container)_100%)] shadow-moon">
              <h3 className="mt-3 text-[1.5rem] leading-[1.35] text-onSurface">{moodPreview.length > 0 ? "최근 머문 감정이에요" : "감정이 쌓이면 흐름이 보여요"}</h3>
              <p className="mt-3 text-sm leading-7 text-onSurfaceVariant">
                {moodPreview.length > 0
                  ? "지금까지 남겨둔 감정만으로도 최근의 결이 조용히 보이고 있어요."
                  : "몇 번의 기록만 지나도 어떤 감정이 오래 머무는지 조금씩 보이기 시작해요."}
              </p>
              {moodPreview.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {moodPreview.map((mood, index) => (
                    <span
                      key={`${mood}-${index}`}
                      className={`rounded-full px-3 py-2 text-xs font-medium ${index === 0
                        ? "bg-primaryFixed text-primary"
                        : index === 1
                          ? "bg-secondaryContainer text-secondary"
                          : "bg-surfaceContainer text-onSurfaceVariant"
                        }`}
                    >
                      {mood}
                    </span>
                  ))}
                </div>
              ) : null}
            </SurfaceCard>

            <Link href="/journal/history">
              <SurfaceCard className="h-full border border-outlineVariant/70 bg-[linear-gradient(180deg,var(--color-surface-container-lowest)_0%,var(--color-secondary-container)_100%)] shadow-moon transition hover:-translate-y-0.5">
                <h3 className="mt-3 text-[1.5rem] leading-[1.35] text-onSurface">모아둔 기록을 다시 펼쳐봐요</h3>
                <p className="mt-3 text-sm leading-7 text-onSurfaceVariant">최근 감정의 흐름과 자주 머문 결을 한 번에 볼 수 있어요.</p>
                <div className="mt-6 flex justify-end">
                  <span className="inline-flex rounded-full bg-surfaceContainerLowest px-4 py-2 text-xs font-semibold text-secondary">지난 기록 보기</span>
                </div>
              </SurfaceCard>
            </Link>
          </div>
        </SurfaceCard>
      </section>
    </main>
  );
}
