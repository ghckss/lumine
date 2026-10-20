"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import { useLumine } from "@/hooks/useLumine";

export function AppShell({ children }: { children: ReactNode }) {
  const { data } = useLumine();
  const date = useMemo(
    () =>
      new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" }),
    [],
  );

  return (
    <div className="grid min-h-screen grid-cols-[248px_minmax(0,1fr)] max-lg:grid-cols-[190px_minmax(0,1fr)] max-sm:block max-sm:pb-[72px]">
      <aside className="sticky top-0 z-20 flex h-screen flex-col border-r border-[#e5ddf3]/90 bg-white/70 px-[22px] pt-8 pb-6 backdrop-blur-xl max-lg:px-3.5 max-sm:hidden">
        <Link
          href="/"
          className="flex items-center gap-3 px-2.5 pb-8 no-underline"
          aria-label="Lumine 홈"
        >
          <span className="brand-mark" aria-hidden="true" />
          <span>
            <span className="block font-serif text-[23px] leading-none font-bold tracking-[-.02em] text-[#3f2d5c]">
              Lumine
            </span>
            <span className="mt-1 block text-[10px] tracking-[.04em] text-[#746985]">
              LUMIS ETERNE
            </span>
          </span>
        </Link>
        <Navigation />
        <div className="mt-auto rounded-[18px] bg-linear-to-br from-[#ebe2ff] to-[#f7f2ff] p-4 max-lg:hidden">
          <strong className="block font-serif text-sm leading-6">
            오늘 마음은
            <br />
            어떤 빛인가요?
          </strong>
          <span className="mt-1.5 block text-[11px] leading-5 text-[#746985]">
            작은 감정도 흘려보내지 말고
            <br />
            가만히 이름을 붙여보세요.
          </span>
        </div>
        <div className="px-2.5 pt-5 text-[10px] tracking-[.12em] text-[#a39aaf]">
          YOUR QUIET LIGHT
        </div>
      </aside>
      <main className="min-w-0 px-[4vw] pb-12 max-sm:px-4 max-sm:pb-7">
        <header className="mx-auto flex h-[86px] max-w-[1180px] items-center justify-between max-sm:h-[67px]">
          <span className="text-[11px] font-extrabold tracking-[.12em] text-[#72559d] uppercase">
            마음의 빛을 기록하는 공간
          </span>
          <div className="flex items-center gap-2.5">
            <span className="rounded-full border border-[#e5ddf3] bg-white/70 px-3.5 py-2 text-xs text-[#746985] max-sm:hidden">
              {date}
            </span>
            <Link
              className="grid size-[38px] place-items-center rounded-full bg-[#72559d] font-extrabold text-white no-underline shadow-[0_8px_20px_rgba(114,85,157,.22)]"
              href="/settings"
              aria-label="설정 열기"
            >
              {data.name.slice(0, 1)}
            </Link>
          </div>
        </header>
        <section className="mx-auto max-w-[1180px] animate-[rise_.38s_cubic-bezier(.2,.8,.2,1)] max-sm:pb-5">
          {children}
        </section>
      </main>
      <Navigation mobile />
    </div>
  );
}
