import Link from "next/link";

export default function ScreeningStartPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background font-body text-onSurface selection:bg-primaryContainer selection:text-onPrimaryContainer">
      <header className="fixed top-0 z-50 w-full bg-background/80 shadow-sm shadow-secondary/5 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-8 py-6">
          <Link href="/" className="text-primary transition-opacity duration-300 hover:opacity-70">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </Link>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-medium tracking-tighter text-primary">lumine</h1>
          <div className="h-6 w-6" />
        </div>
      </header>

      <main className="relative mx-auto flex min-h-screen w-full max-w-screen-md flex-col justify-center px-6 pb-32 pt-28 md:px-12">
        <div className="flex flex-col space-y-16">
          <div className="space-y-8 pr-12 md:pr-24">
            <h2 className="break-keep text-[2.5rem] font-light leading-[1.4] tracking-wider text-primary">
              오늘, 당신의 마음을
              <br />
              가만히 들여다봅니다
            </h2>
            <div className="h-px w-12 bg-primary/20" />
            <p className="break-keep text-[1.05rem] font-light leading-[1.8] text-onSurfaceVariant">
              바쁜 일상을 잠시 멈추고,
              <br />
              내면의 소리에 귀를 기울여보세요.
              <br />
              <br />
              솔직한 대화는
              <br />
              마음의 결을 다스리는 시작이 됩니다.
            </p>
          </div>

          <div className="flex flex-col items-start space-y-6 pt-12">
            <div className="flex items-center space-x-2 text-sm tracking-wide text-secondary/80">
              <span className="material-symbols-outlined text-[18px] opacity-70">schedule</span>
              <span>약 3분 소요</span>
            </div>
            <Link
              href="/screening/questions"
              className="group flex w-full items-center justify-center space-x-4 rounded-full bg-gradient-to-br from-primary to-primaryContainer px-12 py-5 text-lg text-white shadow-moon transition-all duration-500 hover:opacity-90 sm:w-auto"
            >
              <span className="font-medium tracking-widest">시작하기</span>
              <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
