"use client";

import { usePathname, useRouter } from "next/navigation";
import { useBridgeBootstrap } from "@/shared/hooks/useBridgeBootstrap";
import { AppIcon } from "@/shared/components/AppIcon";

type HeaderConfig = {
  title: string;
  subtitle?: string | null;
  showBack?: boolean;
  fallbackHref?: string;
};

function getHeaderConfig(pathname: string, displayName: string | null): HeaderConfig {
  if (pathname === "/") {
    return {
      title: "Lumine",
      subtitle: displayName ? `${displayName}님, 오늘의 마음` : "오늘의 마음"
    };
  }

  if (pathname.startsWith("/journal/history")) {
    return { title: "기록의 숨결", showBack: true, fallbackHref: "/" };
  }

  if (pathname.startsWith("/journal")) {
    return { title: "감정 일기", showBack: true, fallbackHref: "/" };
  }

  if (pathname.startsWith("/screening/questions")) {
    return { title: "마음 살펴보기", showBack: true, fallbackHref: "/screening/start" };
  }

  if (pathname.startsWith("/screening/result")) {
    return { title: "분석 결과", showBack: true, fallbackHref: "/screening/questions" };
  }

  if (pathname.startsWith("/screening/start")) {
    return { title: "마음 살펴보기", showBack: true, fallbackHref: "/" };
  }

  if (pathname.startsWith("/support")) {
    return { title: "마음으로 잇는 연결", showBack: true, fallbackHref: "/" };
  }

  return { title: "Lumine" };
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const bootstrap = useBridgeBootstrap();
  const config = getHeaderConfig(pathname, bootstrap.displayName);

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    if (config.fallbackHref) {
      router.push(config.fallbackHref);
    }
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-outlineVariant/50 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 sm:px-6">
        <div className="flex w-12 items-center justify-start">
          {config.showBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surfaceContainerLow"
              aria-label="뒤로가기"
            >
              <AppIcon name="arrow-back" className="h-[22px] w-[22px]" />
            </button>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-lg font-semibold tracking-[0.14em] text-primary">{config.title}</p>
          {config.subtitle ? (
            <p className="mt-0.5 truncate text-[11px] tracking-[0.18em] text-onSurfaceVariant">{config.subtitle}</p>
          ) : null}
        </div>

        <div className="w-12" />
      </div>
    </header>
  );
}
