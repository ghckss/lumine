import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-onSurface">
      <div className="mx-auto max-w-md rounded-2xl bg-surfaceContainerLowest px-6 py-8 shadow-sm">
        <p className="text-sm text-secondary">lumine</p>
        <h1 className="mt-3 text-3xl font-semibold">이 화면은 네이티브 로그인 이후에 열려요</h1>
        <p className="mt-4 text-sm leading-7 text-onSurfaceVariant">
          웹에서는 Stitch 화면을 바로 확인할 수 있게 열어뒀어요. 홈으로 돌아가면 새 디자인을 볼 수 있어요.
        </p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">
          홈으로 이동
        </Link>
      </div>
    </main>
  );
}
