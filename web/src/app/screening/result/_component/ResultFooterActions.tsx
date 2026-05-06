import Link from "next/link";

export function ResultFooterActions() {
  return (
    <section className="mt-20 flex flex-col items-center space-y-6">
      <Link href="/journal" className="w-full rounded-full bg-gradient-to-br from-primary to-primaryContainer px-12 py-5 text-center text-lg tracking-wide text-white md:w-auto">
        오늘의 감정 일기 쓰기
      </Link>
      <Link href="/" className="text-sm tracking-wide text-secondary underline decoration-secondary/30 underline-offset-8">
        홈으로 돌아가기
      </Link>
    </section>
  );
}
