"use client";

import { ReactNode } from "react";
import { useAuthStore } from "@/shared/store/auth-store";

type AppShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AppShell({ eyebrow, title, description, children }: AppShellProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const displayName = useAuthStore((state) => state.displayName);
  const greeting = isAuthenticated && displayName ? `${displayName}님` : eyebrow;

  return (
    <main className="min-safe-screen mx-auto flex w-full max-w-xl flex-col gap-6 px-5 py-6 sm:px-6 sm:py-8">
      <header className="relative overflow-hidden rounded-[34px] border border-white/16 bg-[linear-gradient(180deg,rgba(91,73,154,0.92),rgba(63,49,114,0.9)_52%,rgba(46,35,86,0.96))] px-5 py-6 text-white shadow-[0_28px_90px_rgba(24,16,54,0.34)]">
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0))]" />
        <div className="absolute right-[-26px] top-[-22px] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.28),rgba(255,255,255,0.03)_66%)]" />
        <div className="absolute left-[-18px] top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(202,192,255,0.18),rgba(202,192,255,0.02)_72%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(18,14,38,0.2))]" />
        <div className="absolute bottom-[-52px] left-[-6%] h-28 w-[58%] rounded-t-[999px] bg-[rgba(255,255,255,0.06)] blur-2xl" />
        <div className="absolute bottom-[-40px] right-[-4%] h-24 w-[52%] rounded-t-[999px] bg-[rgba(255,255,255,0.05)] blur-2xl" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-2 text-[11px] font-medium tracking-[0.16em] text-white/84">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f8ecff]" />
            {greeting}
          </div>
        </div>

        <div className="relative z-10 mt-6 max-w-[32rem]">
          <h1 className="text-[2.05rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
            {title}
          </h1>
          <p className="mt-3 max-w-[28rem] text-sm leading-6 text-white/76">{description}</p>
        </div>
      </header>
      <section className="rounded-[32px] border border-white/55 bg-[rgba(252,249,255,0.9)] p-4 shadow-[0_18px_80px_rgba(62,45,116,0.12)] backdrop-blur-xl sm:p-5">
        <div className="grid gap-4">{children}</div>
      </section>
    </main>
  );
}
