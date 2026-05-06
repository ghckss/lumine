import Link from "next/link";
import { AppIcon } from "@/shared/components/AppIcon";

export function SupportJournalLinkSection() {
  return (
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
  );
}
