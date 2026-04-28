"use client";

import Link from "next/link";
import { AppShell } from "@/shared/components/app-shell";
import { PrimaryButton } from "@/shared/components/primary-button";
import { SurfaceCard } from "@/shared/components/surface-card";
import { useJournalEntry } from "@/shared/hooks/use-journal-entry";
import { getTodayDate } from "@/shared/lib/date";
import { useAuthStore } from "@/shared/store/auth-store";
import { useScreeningStore } from "@/shared/store/screening-store";

const steps = [
  {
    index: "01",
    title: "지금 마음을 살펴봐요",
    body: "짧은 질문에 답하면서 오늘 상태를 돌아봐요."
  },
  {
    index: "02",
    title: "감정 세 가지를 남겨봐요",
    body: "길게 쓰지 않아도 괜찮아요. 감정 세 가지만 골라도 돼요."
  },
  {
    index: "03",
    title: "필요하면 도움을 받아요",
    body: "혼자 버티기 어려운 날에는 바로 연락할 수 있어요."
  }
];

export default function HomePage() {
  const displayName = useAuthStore((state) => state.displayName);
  const today = getTodayDate();
  const { data: todayJournalEntry } = useJournalEntry(today);
  const lastCompletedDate = useScreeningStore((state) => state.lastCompletedDate);
  const moodPreview = todayJournalEntry?.emotions.map((emotion) => emotion.label) ?? [];
  const hasCompletedScreeningToday = lastCompletedDate === today;

  return (
    <AppShell
      eyebrow="오늘의 마음"
      title={`${displayName ?? "오늘"}님 마음이 머무는 쪽부터 살펴봐요`}
      description="오늘의 나를 돌아보고, 남기고 싶은 감정을 털어놓아봐요."
    >
      <section className="grid gap-4">
        <SurfaceCard className="overflow-hidden bg-[linear-gradient(135deg,#f3edff_0%,#ffffff_45%,#f8f5ff_100%)] p-0">
          <div className="relative px-2 py-2">
            <div className="absolute right-[-32px] top-[-28px] h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(128,106,217,0.22),rgba(128,106,217,0.02)_70%)]" />
            <div className="absolute bottom-[-42px] right-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(181,167,239,0.26),rgba(181,167,239,0.04)_70%)]" />

            <div className="relative z-10 max-w-[70%]">
              <p className="text-sm font-medium text-accent">오늘의 시작</p>
              <h2 className="mt-3 text-[2rem] font-semibold leading-[1.15] text-text">
                지금 마음을
                <br />
                너무 무겁지 않게
                <br />
                남겨봐요
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                {todayJournalEntry
                  ? "오늘 남긴 기록이 여기 남아 있어요."
                  : hasCompletedScreeningToday
                    ? "오늘 상태는 이미 한 번 돌아봤어요."
                    : "길게 쓰지 않아도 괜찮아요."}
              </p>
            </div>

            {moodPreview.length > 0 ? (
              <div className="relative z-10 mt-6 flex flex-wrap gap-2">
                {moodPreview.map((mood) => (
                  <span
                    key={mood}
                    className="rounded-full border border-[#ddd2ff] bg-white/84 px-3 py-2 text-xs font-medium text-[#5d4fa0]"
                  >
                    {mood}
                  </span>
                ))}
              </div>
            ) : null}

            <div
              className={`relative z-10 mt-6 grid gap-3 ${hasCompletedScreeningToday || todayJournalEntry ? "grid-cols-1" : "grid-cols-2"
                }`}
            >
              {!hasCompletedScreeningToday ? (
                <Link href="/screening/start" className="block w-full">
                  <PrimaryButton className="h-12 w-full">나를 돌아보기</PrimaryButton>
                </Link>
              ) : null}
              {!todayJournalEntry ? (
                <Link
                  href="/journal"
                  className="flex h-12 w-full items-center justify-center rounded-full border border-line bg-white/86 px-5 py-3.5 text-center text-sm font-semibold text-text"
                >
                  감정 일기 쓰기
                </Link>
              ) : null}
            </div>
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-3">
        {steps.map((step) => (
          <SurfaceCard key={step.index}>
            <div className="grid grid-cols-[56px_1fr] items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primarySoft text-sm font-semibold text-accent">
                {step.index}
              </div>
              <div>
                <p className="text-lg font-semibold text-text">{step.title}</p>
                <p className="mt-2 text-sm leading-7 text-muted">{step.body}</p>
              </div>
            </div>
          </SurfaceCard>
        ))}
      </section>
    </AppShell>
  );
}
