"use client";

import { webToApp } from "@/shared/bridge/web-to-app";
import { SurfaceCard } from "@/shared/components/surface-card";
import { useSupportResources } from "@/shared/hooks/use-support-resources";

export function SupportResourceList() {
  const { data, isLoading } = useSupportResources();

  if (isLoading) {
    return <SurfaceCard>도움 정보를 불러오고 있어요.</SurfaceCard>;
  }

  async function handleOpenHotline(phone: string) {
    if (typeof window !== "undefined" && window.ReactNativeWebView) {
      try {
        await webToApp("support.openHotline", { phone });
        return;
      } catch {
      }
    }

    window.location.href = `tel:${phone}`;
  }

  return (
    <div className="grid gap-3">
      {data?.map((resource) => (
        <button
          key={resource.code}
          type="button"
          onClick={() => handleOpenHotline(resource.phone)}
          className="rounded-[24px] border border-line/70 bg-surfaceElevated px-5 py-4 text-left shadow-[0_10px_24px_rgba(74,58,122,0.05)] transition hover:-translate-y-0.5 hover:border-accent"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-base font-semibold">{resource.title}</div>
              <p className="mt-1 text-sm text-accent">{resource.phone}</p>
            </div>
            <div className="rounded-full bg-primarySoft px-3 py-2 text-xs font-semibold text-accent">
              바로 연결
            </div>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted">{resource.description}</p>
        </button>
      ))}
    </div>
  );
}
