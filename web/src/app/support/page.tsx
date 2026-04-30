"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppIcon } from "@/shared/components/AppIcon";
import { useSupportResources } from "@/shared/hooks/useSupportResources";

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
    <div className="min-h-screen pb-24 font-body text-onSurface">
      <main className="mx-auto w-full max-w-xl px-6 pt-8">
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
                <AppIcon name="support-agent" className="h-8 w-8 text-secondary/60" />
              </div>
              <a href={`tel:${primaryResource.phone}`} className="flex w-full items-center justify-center gap-2 rounded-full bg-surfaceContainerLow py-3 text-sm text-secondary transition-colors duration-300 hover:bg-secondaryContainer">
                <AppIcon name="call" className="h-[18px] w-[18px]" />
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
                    <AppIcon
                      name={resource.phone === "119" ? "emergency" : "health-and-safety"}
                      className="h-5 w-5 text-primary/50"
                    />
                    <h3 className="text-xl text-primary">{resource.phone}</h3>
                  </div>
                  <p className="mb-4 text-[11px] leading-tight text-onSurfaceVariant">{resource.title}</p>
                </div>
                <a href={`tel:${resource.phone}`} className="flex w-max items-center gap-1 border-b border-primary/20 pb-1 text-left text-xs text-primary">
                  통화 연결
                  <AppIcon name="arrow-outward" className="h-[14px] w-[14px]" />
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-xl bg-surfaceContainerLow p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surfaceContainerLowest shadow-ambient">
            <AppIcon name="auto-awesome" className="h-6 w-6 text-primary" />
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
