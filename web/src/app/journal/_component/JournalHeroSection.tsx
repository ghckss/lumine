export function JournalHeroSection() {
  return (
    <header className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary)_88%,black),color-mix(in_srgb,var(--color-primary)_62%,var(--color-on-primary-container))_100%)] px-6 py-7 text-white shadow-moon sm:px-7 sm:py-8">
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0))]" />
      <div className="absolute right-[-24px] top-[-24px] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),rgba(255,255,255,0.02)_68%)]" />

      <div className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[11px] font-medium tracking-[0.18em] text-white/84 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
        TODAY LOG
      </div>

      <div className="relative z-10 mt-6 max-w-[31rem]">
        <p className="text-xs uppercase tracking-[0.24em] text-white/60">Lumine</p>
        <h1 className="mt-3 text-[2.15rem] leading-[1.18] text-white sm:text-[2.35rem]">
          오늘 오래 남은 장면을
          <br />
          천천히 적어봐요
        </h1>
        <p className="mt-4 max-w-[28rem] text-sm leading-7 text-white/76">
          감정 세 가지와 오늘 있었던 일을 남겨두면, 나중에 흐름을 다시 보기 쉬워져요.
        </p>
      </div>
    </header>
  );
}
