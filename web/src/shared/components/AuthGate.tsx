"use client";

import { useBridgeBootstrap } from "@/shared/hooks/useBridgeBootstrap";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const bootstrap = useBridgeBootstrap();

  if (!bootstrap.ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10 text-onSurface">
        <div className="w-full max-w-md rounded-[32px] bg-surfaceContainerLowest px-7 py-9 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-primary/70">lumis eterne</p>
          <h1 className="mt-4 text-[2rem] leading-[1.35] text-onSurface">조금만 더 머물러주세요</h1>
          <p className="mt-4 text-sm leading-7 text-onSurfaceVariant">
            오늘의 기록과 마음 흐름을 차분히 준비하고 있어요.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
