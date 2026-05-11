"use client";

import { useEffect, useState } from "react";
import { AppIcon } from "@/shared/components/AppIcon";
import { removeDeviceValue } from "@/shared/lib/bridge-device";

type AppHeaderMenuProps = {
  onClose: () => void;
  onNavigate: (href: string) => void;
};

type SheetType = "terms" | "privacy" | null;

const appMeta = {
  version: "0.0.1",
  termsUpdatedAt: "2026-04-29",
  privacyUpdatedAt: "2026-04-29"
} as const;

const deviceCacheKeys = [
  "journal.history",
  "screening.history",
  "screening.latest",
  "sync.queue"
] as const;

const termsSections = [
  "Lumine은 사용자가 남긴 기록을 마음을 돌아보는 용도로 제공해요.",
  "앱이 제공하는 문구와 결과는 의료적 진단이나 치료를 대신하지 않아요.",
  "위험 신호가 보일 때는 앱 안내보다 전문 기관 연결을 우선해요.",
  "기기 저장 데이터를 사용하는 경우, 사용자는 언제든 직접 삭제를 요청할 수 있어요."
];

const privacySections = [
  "비회원 상태에서는 기록을 서버 DB 대신 기기 저장소에 보관해요.",
  "회원 상태에서는 서버 저장과 함께 기기 저장소에 캐시를 유지해요.",
  "설문과 기록 결과는 앱 흐름을 이어가기 위한 범위 안에서 저장돼요.",
  "기기 저장 데이터 비우기를 선택하면 앱 안에 저장된 로컬 기록과 대기 데이터가 삭제돼요."
];

export function AppHeaderMenu({ onClose, onNavigate }: AppHeaderMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [sheetType, setSheetType] = useState<SheetType>(null);
  const [isClearingData, setIsClearingData] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const scrollY = window.scrollY;
    const { body, documentElement } = document;
    const previousBodyStyle = {
      overflow: body.style.overflow,
      overscrollBehavior: body.style.overscrollBehavior,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width
    };
    const previousRootOverscroll = documentElement.style.overscrollBehavior;

    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    documentElement.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previousBodyStyle.overflow;
      body.style.overscrollBehavior = previousBodyStyle.overscrollBehavior;
      body.style.position = previousBodyStyle.position;
      body.style.top = previousBodyStyle.top;
      body.style.width = previousBodyStyle.width;
      documentElement.style.overscrollBehavior = previousRootOverscroll;
      window.scrollTo(0, scrollY);
    };
  }, []);

  function closeWithAnimation() {
    setIsVisible(false);
    window.setTimeout(() => {
      setSheetType(null);
      onClose();
    }, 220);
  }

  function navigateWithAnimation(href: string) {
    setIsVisible(false);
    window.setTimeout(() => {
      setSheetType(null);
      onNavigate(href);
    }, 180);
  }

  async function handleClearDeviceData() {
    if (isClearingData) {
      return;
    }

    const confirmed = window.confirm("이 기기에 저장된 기록과 대기 데이터를 지울까요?");

    if (!confirmed) {
      return;
    }

    setIsClearingData(true);

    try {
      await Promise.all(deviceCacheKeys.map((key) => removeDeviceValue(key)));
      closeWithAnimation();
    } finally {
      setIsClearingData(false);
    }
  }

  const legalTitle = sheetType === "terms" ? "이용약관" : sheetType === "privacy" ? "개인정보 처리 안내" : "";
  const legalSections = sheetType === "terms" ? termsSections : sheetType === "privacy" ? privacySections : [];
  const legalUpdatedAt = sheetType === "terms" ? appMeta.termsUpdatedAt : appMeta.privacyUpdatedAt;

  return (
    <div className="fixed inset-0 z-[60] h-[100dvh] overflow-hidden overscroll-none bg-slate-950/35 backdrop-blur-[2px]">
      <button
        type="button"
        onClick={closeWithAnimation}
        className={`absolute inset-0 h-full w-full touch-none transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"}`}
        aria-label="메뉴 닫기"
      />

      <div
        className={`relative z-10 flex h-[100dvh] max-h-[100dvh] w-full touch-pan-y flex-col overflow-y-auto overscroll-none bg-background px-6 pb-10 pt-6 transition-transform duration-300 ease-out ${isVisible ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex w-full items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary/70">Lumine</p>
            <p className="mt-3 text-3xl font-semibold text-onSurface">추가 기능</p>
            <p className="mt-3 text-sm leading-7 text-onSurfaceVariant">
              조용히 이어가기 위한 안내와 기기 설정을 여기에서 다룰게요.
            </p>
          </div>
          <button
            type="button"
            onClick={closeWithAnimation}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-primary transition-colors hover:bg-surfaceContainerLow"
            aria-label="닫기"
          >
            <AppIcon name="close" className="h-5 w-5" />
          </button>
        </div>

        {sheetType ? (
          <div className="mt-10 flex w-full flex-1 flex-col rounded-[32px] bg-surfaceContainerLowest px-6 py-6 shadow-ambient">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold text-onSurface">{legalTitle}</p>
                <p className="mt-2 text-sm text-onSurfaceVariant">앱 이용과 데이터 처리 방식을 간단히 정리했어요.</p>
              </div>
              <button
                type="button"
                onClick={() => setSheetType(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surfaceContainerLow"
                aria-label="닫기"
              >
                <AppIcon name="close" className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8 flex flex-1 flex-col gap-4">
              {legalSections.map((section) => (
                <div key={section} className="rounded-[24px] bg-surfaceContainerLow px-5 py-5">
                  <p className="text-sm leading-7 text-onSurfaceVariant">{section}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[24px] bg-secondaryContainer/60 px-5 py-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-secondary">최종 업데이트</p>
              <p className="mt-2 text-sm text-secondary">{legalUpdatedAt}</p>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid w-full gap-4">
            <button
              type="button"
              onClick={() => navigateWithAnimation("/support")}
              className="rounded-[28px] bg-[linear-gradient(135deg,var(--color-secondary-container)_0%,var(--color-surface-container-lowest)_100%)] px-6 py-6 text-left shadow-moon transition hover:bg-surfaceContainerLow"
            >
              <p className="text-lg font-semibold text-onSurface">도움 요청</p>
              <p className="mt-2 text-sm leading-7 text-onSurfaceVariant">지금 바로 연결할 수 있는 도움 정보를 확인해요.</p>
            </button>

            <button
              type="button"
              onClick={() => setSheetType("terms")}
              className="rounded-[28px] bg-surfaceContainerLowest px-6 py-6 text-left shadow-ambient transition hover:bg-surfaceContainerLow"
            >
              <p className="text-lg font-semibold text-onSurface">이용약관</p>
              <p className="mt-2 text-sm leading-7 text-onSurfaceVariant">앱 이용 방식과 기본 안내를 확인해요.</p>
            </button>

            <button
              type="button"
              onClick={() => setSheetType("privacy")}
              className="rounded-[28px] bg-surfaceContainerLowest px-6 py-6 text-left shadow-ambient transition hover:bg-surfaceContainerLow"
            >
              <p className="text-lg font-semibold text-onSurface">개인정보 처리 안내</p>
              <p className="mt-2 text-sm leading-7 text-onSurfaceVariant">기기 저장 데이터와 기록 정보가 어떻게 다뤄지는지 확인해요.</p>
            </button>

            <button
              type="button"
              onClick={() => void handleClearDeviceData()}
              disabled={isClearingData}
              className="rounded-[28px] bg-surfaceContainerLowest px-6 py-6 text-left shadow-ambient transition hover:bg-surfaceContainerLow disabled:opacity-60"
            >
              <p className="text-lg font-semibold text-onSurface">기기 저장 데이터 비우기</p>
              <p className="mt-2 text-sm leading-7 text-onSurfaceVariant">
                {isClearingData ? "지우는 중이에요." : "이 기기에만 남아 있는 캐시와 대기 데이터를 지워요."}
              </p>
            </button>

            <div className="flex justify-end pt-2">
              <div className="rounded-[28px] bg-secondaryContainer/60 px-6 py-5 text-right">
                <p className="text-xs font-semibold tracking-[0.16em] text-secondary">앱 버전</p>
                <p className="mt-2 text-lg font-semibold text-secondary">{appMeta.version}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
