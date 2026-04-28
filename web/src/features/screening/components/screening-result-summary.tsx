"use client";

import { useScreeningResult } from "@/shared/hooks/use-screening-result";
import { formatKoreanDate } from "@/shared/lib/date";
import { SurfaceCard } from "@/shared/components/surface-card";
import { useScreeningStore } from "@/shared/store/screening-store";

export function ScreeningResultSummary() {
  const { data: fetchedResult, isLoading } = useScreeningResult();
  const storedResult = useScreeningStore((state) => state.result);
  const data = storedResult ?? fetchedResult;

  if (isLoading || !data) {
    return <SurfaceCard>결과를 정리하고 있어요.</SurfaceCard>;
  }

  return (
    <>
      <SurfaceCard>
        <h1 className="mt-2 text-2xl font-semibold leading-tight">{data.publicSummary}</h1>
        <p className="mt-4 text-base leading-7 text-muted">{data.publicComfortMessage}</p>
      </SurfaceCard>

      <SurfaceCard>
        <h2 className="text-xl font-semibold">지금 해보면 좋을 것 같아요</h2>
        <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted">
          {data.recommendedActions.map((action) => (
            <li key={action}>- {action}</li>
          ))}
        </ul>
      </SurfaceCard>
    </>
  );
}
