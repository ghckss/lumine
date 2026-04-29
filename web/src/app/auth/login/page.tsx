import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-onSurface">
      <div className="mx-auto max-w-md rounded-[32px] bg-surfaceContainerLowest px-6 py-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-primary/70">lumis eterne</p>
        <h1 className="mt-3 text-3xl font-semibold">조용히 시작해볼까요?</h1>
        <p className="mt-4 text-sm leading-7 text-onSurfaceVariant">
          카카오 또는 구글로 시작하면, 바로 다음 흐름으로 이어갈게요.
        </p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">
          홈으로 이동
        </Link>
      </div>
    </main>
  );
}
