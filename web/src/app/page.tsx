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

const softPrompts = [
  "마음이 선명하지 않아도 괜찮아요.",
  "한 걸음 남겼다면 그것만으로도 충분해요.",
  "오늘 필요한 만큼은 이미 잘 해냈어요."
];

export default function HomePage() {
  const displayName = useAuthStore((state) => state.displayName);
  const today = getTodayDate();
  const { data: todayJournalEntry } = useJournalEntry(today);
  const lastCompletedDate = useScreeningStore((state) => state.lastCompletedDate);
  const moodPreview = todayJournalEntry?.emotions.map((emotion) => emotion.label) ?? [];
  const hasCompletedScreeningToday = lastCompletedDate === today;
  const hasCompletedJournalToday = Boolean(todayJournalEntry);
  const completedCount = Number(hasCompletedScreeningToday) + Number(hasCompletedJournalToday);
  const prompt = softPrompts[completedCount];
  const guidanceTitle =
    completedCount === 2
      ? "오늘 필요한 만큼은 이미 남겼어요"
      : completedCount === 1
        ? "오늘 한 걸음은 이미 지나왔어요"
        : "오늘은 하나만 시작해봐도 괜찮아요";
  const guidanceBody =
    completedCount === 2
      ? "남겨둔 흐름은 지난 기록에서 다시 볼 수 있어요."
      : completedCount === 1
        ? "조금 여유가 생기면 남은 한 가지를 이어가도 괜찮아요."
        : "상태를 먼저 보거나, 감정부터 적어도 괜찮아요.";
  const statusBadges = [
    hasCompletedScreeningToday ? "오늘 나를 돌아봤어요" : "오늘 상태 확인이 남아 있어요",
    hasCompletedJournalToday ? "오늘 감정을 남겼어요" : "오늘 감정 기록이 남아 있어요"
  ];
  const latestMoodLabel = hasCompletedJournalToday ? "최근 머문 감정" : "기록이 쌓이면 흐름이 보여요";
  const latestMoodDescription = hasCompletedJournalToday
    ? "오늘 자주 머문 감정부터 천천히 살펴봐도 괜찮아요."
    : "감정을 몇 번 남기면 어떤 결이 오래 머무는지 조금씩 보이기 시작해요.";

  return (
    <AppShell
      eyebrow="오늘의 마음"
      title={`${displayName ?? "오늘"}님 마음이 머무는 쪽부터 살펴봐요`}
      description="오늘의 나를 돌아보고, 남기고 싶은 감정을 털어놓아봐요."
      secondary={
        <section className="grid gap-4 rounded-[32px] border border-white/45 bg-[rgba(248,243,255,0.68)] px-4 py-5 shadow-[0_14px_48px_rgba(62,45,116,0.08)] backdrop-blur-xl sm:px-5 sm:py-6">
          <div className="flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-sm font-medium text-accent">마음 돌아보기</p>
              <h3 className="mt-2 text-2xl font-semibold text-text">오늘 흐름과 지난 기록을 따로 모아봤어요</h3>
            </div>
          </div>

          <SurfaceCard>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-accent">안내</p>
                <h3 className="mt-2 text-xl font-semibold text-text">기록을 다시 펼쳐볼 준비가 될 때 봐도 괜찮아요</h3>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-accent">오늘의 흐름</p>
                <h3 className="mt-2 text-2xl font-semibold text-text">{guidanceTitle}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{guidanceBody}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {statusBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-line bg-white/82 px-3 py-2 text-xs font-medium text-text"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="mt-5 rounded-[22px] bg-[linear-gradient(135deg,#f6f0ff_0%,#fcfcfc_100%)] px-4 py-4">
              <p className="text-sm leading-7 text-muted">{prompt}</p>
            </div>
          </SurfaceCard>

          <div className="grid gap-3 sm:grid-cols-2">
            <SurfaceCard>
              <p className="text-sm font-medium text-accent">{latestMoodLabel}</p>
              <h3 className="mt-2 text-xl font-semibold text-text">
                {hasCompletedJournalToday ? "지금 마음에 자주 닿는 결이 있어요" : "조금씩 모이면 더 잘 보여요"}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted">{latestMoodDescription}</p>
              {moodPreview.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {moodPreview.map((mood) => (
                    <span
                      key={`recent-${mood}`}
                      className="rounded-full border border-[#ddd2ff] bg-white/84 px-3 py-2 text-xs font-medium text-[#5d4fa0]"
                    >
                      {mood}
                    </span>
                  ))}
                </div>
              ) : null}
            </SurfaceCard>

            <Link href="/journal/history">
              <SurfaceCard className="h-full bg-[linear-gradient(135deg,#f4efff_0%,#ffffff_100%)] transition hover:-translate-y-0.5 hover:border-accent">
                <div className="flex h-full flex-col justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-accent">지난 기록</p>
                    <h3 className="mt-2 text-xl font-semibold text-text">모아둔 마음을 다시 볼 수 있어요</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      남겨둔 감정과 흐름을 한 번에 돌아봐요.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <span className="inline-flex w-fit rounded-full bg-white/88 px-4 py-2 text-xs font-semibold text-accent">
                      지난 기록 보기
                    </span>
                  </div>
                </div>
              </SurfaceCard>
            </Link>
          </div>
        </section>
      }
    >
      <section className="grid gap-4">
        <SurfaceCard className="overflow-hidden bg-[linear-gradient(135deg,#f3edff_0%,#ffffff_45%,#f8f5ff_100%)] p-0">
          <div className="relative px-2 py-2">
            <div className="absolute right-[-32px] top-[-28px] h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(128,106,217,0.22),rgba(128,106,217,0.02)_70%)]" />
            <div className="absolute bottom-[-42px] right-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(181,167,239,0.26),rgba(181,167,239,0.04)_70%)]" />

            <div className="relative z-10 max-w-[70%]">
              <p className="text-sm font-medium text-accent">오늘의 시작</p>
              <h2 className="mt-3 text-[2rem] font-semibold leading-[1.15] text-text">
                오늘 마음을
                <br />
                너무 무겁게
                <br />
                들여다보지 않아도 돼요
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
