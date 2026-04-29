"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSupportResources } from "@/shared/hooks/use-support-resources";

export default function SupportPage() {
  const searchParams = useSearchParams();
  const { data: resources = [] } = useSupportResources();
  const primaryResource = resources[0];
  const secondaryResources = resources.slice(1);
  const fromSafetyFlow = searchParams.get("source") === "safety";

  async function handleNotifySomeone() {
    const message = "지금 조금 힘들어서, 괜찮다면 잠깐 이야기 나누고 싶어요.";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: message });
        return;
      } catch {
        return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(message);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24 font-body text-onSurface">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between bg-gradient-to-b from-background to-transparent px-6 py-4 backdrop-blur-md">
        <Link href="/" className="-ml-2 rounded-full p-2 text-primary transition-opacity duration-300 hover:opacity-70">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-lg font-medium tracking-widest text-primary">마음으로 잇는 연결</h1>
        <div className="w-10" />
      </header>

      <main className="mx-auto max-w-md px-6 pt-28">
        {fromSafetyFlow ? (
          <section className="mb-8 rounded-[28px] border border-secondary/25 bg-[linear-gradient(180deg,var(--color-secondary-container)_0%,var(--color-surface-container-lowest)_100%)] p-6 shadow-moon">
            <p className="text-xs uppercase tracking-[0.22em] text-secondary/80">care first</p>
            <h2 className="mt-3 text-[1.55rem] leading-[1.45] text-onSurface">
              오늘 결과가 조금 무겁게 나왔네요.
            </h2>
            <p className="mt-4 text-sm leading-7 text-onSurfaceVariant">
              혹시 괜찮다면 전문적인 상담을 한 번 받아보는 건 어떨까요? 저는 당신이 더 편안해졌으면 좋겠어요.
              상담을 받으면서도 평소처럼 이곳에 들러주세요. 저는 늘 같은 자리에서 당신을 기다리고 있을게요.
            </p>
          </section>
        ) : null}

        <section className="mb-12 pl-2">
          <h2 className="mb-4 text-4xl leading-[1.6] tracking-wider text-primary">
            마음의 무게를
            <br />
            혼자 짊어지지 마세요
          </h2>
          <p className="w-4/5 text-sm leading-relaxed text-onSurfaceVariant">
            때로는 멈춰서 누군가의 손을 잡는 것만으로도
            <br />
            충분히 괜찮아질 수 있습니다.
          </p>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-3">
          {primaryResource ? (
            <a
              href={`tel:${primaryResource.phone}`}
              className="flex h-14 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary px-6 text-sm font-semibold text-white shadow-moon"
            >
              {primaryResource.phone}로 연결하기
            </a>
          ) : null}
          <a
            href="tel:119"
            className="flex h-14 items-center justify-center rounded-full bg-surfaceContainerLowest px-6 text-sm font-semibold text-secondary shadow-ambient"
          >
            119 도움 요청하기
          </a>
          <button
            type="button"
            onClick={handleNotifySomeone}
            className="flex h-14 items-center justify-center rounded-full bg-surfaceContainerLowest px-6 text-sm font-semibold text-onSurface shadow-ambient"
          >
            주변 사람에게 알리기
          </button>
        </section>

        <section className="mb-16 grid grid-cols-1 gap-6">
          {primaryResource ? (
            <div className="relative overflow-hidden rounded-xl bg-surfaceContainerLowest p-6 shadow-ambient">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-secondaryContainer/30 blur-2xl" />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 text-2xl text-secondary">{primaryResource.phone}</h3>
                  <p className="mb-4 text-xs text-onSurfaceVariant">{primaryResource.title}</p>
                </div>
                <span className="material-symbols-outlined text-3xl text-secondary/60">support_agent</span>
              </div>
              <a href={`tel:${primaryResource.phone}`} className="flex w-full items-center justify-center gap-2 rounded-full bg-surfaceContainerLow py-3 text-sm text-secondary transition-colors duration-300 hover:bg-secondaryContainer">
                <span className="material-symbols-outlined text-[18px]">call</span>
                지금 연결하기
              </a>
            </div>
          ) : null}

          {resources.length === 0 ? (
            <div className="rounded-xl bg-surfaceContainerLowest p-5 shadow-ambient">
              <p className="text-sm leading-7 text-onSurfaceVariant">도움 정보를 불러오고 있어요.</p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            {secondaryResources.map((resource) => (
              <div key={resource.phone} className="flex flex-col justify-between rounded-xl bg-surfaceContainerLowest p-5 shadow-ambient">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-primary/50">{resource.phone === "119" ? "emergency" : "health_and_safety"}</span>
                    <h3 className="text-xl text-primary">{resource.phone}</h3>
                  </div>
                  <p className="mb-4 text-[11px] leading-tight text-onSurfaceVariant">{resource.title}</p>
                </div>
                <a href={`tel:${resource.phone}`} className="flex w-max items-center gap-1 border-b border-primary/20 pb-1 text-left text-xs text-primary">
                  통화 연결
                  <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-xl bg-surfaceContainerLow p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surfaceContainerLowest shadow-ambient">
            <span className="material-symbols-outlined text-2xl text-primary">auto_awesome</span>
          </div>
          <h3 className="mb-2 text-xl text-primary">lumine과 함께 나누기</h3>
          <p className="mb-6 text-xs leading-relaxed text-onSurfaceVariant">
            작은 단어 하나라도 좋습니다.
            <br />
            당신의 이야기를 남겨주세요.
          </p>
          <Link href="/journal" className="rounded-full bg-primary px-8 py-3 text-sm text-white">
            기록 시작하기
          </Link>
        </section>
      </main>
    </div>
  );
}
