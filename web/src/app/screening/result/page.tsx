"use client";

import Link from "next/link";
import { useScreeningLatest } from "@/shared/hooks/use-screening-latest";

export default function ScreeningResultPage() {
  const { data: result } = useScreeningLatest();
  const actions = result?.recommendedActions ?? [];

  return (
    <div className="min-h-screen bg-background pb-24 pt-24 text-onSurface">
      <header className="fixed left-0 top-0 z-50 w-full bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/screening/questions" className="-ml-2 rounded-full p-2 text-primary hover:opacity-60">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </Link>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-medium tracking-widest text-primary">lumine</h1>
          <div className="w-10" />
        </div>
        <div className="h-px w-full bg-surfaceContainerHigh opacity-20" />
      </header>

      <main className="mx-auto px-6 md:max-w-2xl">
        {!result ? (
          <section className="mb-8 mt-8 rounded-[28px] bg-surfaceContainerLowest p-6 shadow-ambient">
            <p className="text-sm leading-7 text-onSurfaceVariant">가장 최근 상태를 불러오고 있어요.</p>
          </section>
        ) : null}

        {result?.requiresSafetyPrompt ? (
          <section className="mb-8 mt-2">
            <div className="overflow-hidden rounded-[28px] border border-secondary/25 bg-[linear-gradient(180deg,var(--color-secondary-container)_0%,var(--color-surface-container-lowest)_100%)] p-6 shadow-moon">
              <p className="text-xs uppercase tracking-[0.22em] text-secondary/80">care first</p>
              <h2 className="mt-3 text-[1.7rem] leading-[1.45] text-onSurface">
                오늘 결과가 조금 무겁게 나왔네요.
              </h2>
              <p className="mt-4 text-sm leading-7 text-onSurfaceVariant">
                혹시 괜찮다면 전문적인 상담을 한 번 받아보는 건 어떨까요? 저는 당신이 더 편안해졌으면 좋겠어요.
                상담을 받으면서도 평소처럼 이곳에 들러주세요. 저는 늘 같은 자리에서 당신을 기다리고 있을게요.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/support"
                  className="flex h-14 flex-1 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary px-6 text-sm font-semibold text-white shadow-moon"
                >
                  도움 연결 보기
                </Link>
                <Link
                  href="/journal"
                  className="flex h-14 flex-1 items-center justify-center rounded-full bg-surfaceContainerLowest px-6 text-sm font-semibold text-secondary"
                >
                  지금 마음 남기기
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <section className="relative mb-16 mt-8">
          <div className="relative z-10 overflow-hidden rounded-xl bg-surfaceContainerLowest p-10 md:p-14">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primaryContainer opacity-20 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-secondaryContainer opacity-20 blur-3xl" />
            <h2 className="mb-8 text-3xl leading-relaxed tracking-wide text-primary md:text-4xl">{result?.publicSummary ?? "최근 상태를 정리하고 있어요."}</h2>
            <p className="text-base font-light leading-loose text-onSurfaceVariant">
              {result?.publicComfortMessage ?? "조금만 기다리면 가장 최근 상태를 불러와요."}
            </p>
          </div>
          <div className="absolute inset-0 z-0 translate-y-4 bg-secondary opacity-5 blur-2xl" />
        </section>

        <section className="mb-16 ml-4 border-l border-surfaceContainerHigh pl-4 md:ml-4 md:pl-8">
          <h3 className="mb-6 text-xl tracking-wide text-primary">이런 시간을 보내면 어떨까요</h3>
          <ul className="space-y-6">
            {actions.map((action) => (
              <li key={action} className="flex items-start">
                <span className="material-symbols-outlined mr-4 mt-0.5 text-secondary/60" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                <div>
                  <p className="text-lg text-onSurface">{action}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20 flex flex-col items-center space-y-6">
          <Link href="/journal" className="w-full rounded-full bg-gradient-to-br from-primary to-primaryContainer px-12 py-5 text-center text-lg tracking-wide text-white md:w-auto">
            오늘의 감정 일기 쓰기
          </Link>
          <Link href="/" className="text-sm tracking-wide text-secondary underline decoration-secondary/30 underline-offset-8">
            홈으로 돌아가기
          </Link>
        </section>
      </main>
    </div>
  );
}
