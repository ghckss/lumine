import Link from "next/link";
import { ScreeningResultSummary } from "@/features/screening/components/screening-result-summary";
import { AppShell } from "@/shared/components/app-shell";

export default function ScreeningResultPage() {
  return (
    <AppShell
      eyebrow="지금 상태 정리"
      title="오늘 마음을 조금 더 또렷하게 바라봐요"
      description="지금 어떤 결이 두드러졌는지 먼저 보고, 이어서 감정을 남겨봐도 괜찮아요."
    >
      <ScreeningResultSummary />

      <div className="flex gap-3">
        <Link
          href="/journal"
          className="flex-1 rounded-full bg-accent px-5 py-4 text-center text-sm font-semibold text-white shadow-[0_10px_30px_rgba(98,76,187,0.24)]"
        >
          오늘 감정 기록하기
        </Link>
        <Link
          href="/"
          className="flex-1 rounded-full border border-line bg-surfaceElevated px-5 py-4 text-center text-sm font-semibold"
        >
          홈으로 이동
        </Link>
      </div>
    </AppShell>
  );
}
