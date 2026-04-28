import Link from "next/link";
import { AppShell } from "@/shared/components/app-shell";
import { PrimaryButton } from "@/shared/components/primary-button";
import { SurfaceCard } from "@/shared/components/surface-card";

export default function ScreeningStartPage() {
  return (
    <AppShell
      eyebrow="마음 체크인"
      title="지금 마음이 어디쯤 있는지 천천히 살펴봐요"
      description="한 번에 다 정리하려 하지 않아도 괜찮아요. 답할 수 있는 만큼만 보면 돼요."
    >
      <SurfaceCard>
        <p className="text-sm text-muted">마음 체크인</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight">
          지금 상태를
          <br />
          가볍게 살펴봐요
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          오늘 마음을 천천히 돌아봐요.
        </p>
        <div className="mt-6 rounded-[20px] bg-primarySoft px-4 py-4 text-sm leading-6 text-text">
          의료적 진단이 아니라, 지금 마음을 돌아보는 시간이예요.
        </div>
      </SurfaceCard>
      <Link href="/screening/questions">
        <PrimaryButton className="w-full">질문 시작하기</PrimaryButton>
      </Link>
    </AppShell>
  );
}
