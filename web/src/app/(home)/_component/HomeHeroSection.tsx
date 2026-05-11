const ripples = [
  { left: "12%", top: "58%", size: "21rem", delay: "0s", duration: "7.2s" },
  { left: "72%", top: "28%", size: "18rem", delay: "2.4s", duration: "7.8s" },
  { left: "42%", top: "88%", size: "24rem", delay: "4.8s", duration: "8.4s" }
] as const;

export function HomeHeroSection() {
  return (
    <header className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary)_88%,black),color-mix(in_srgb,var(--color-primary)_62%,var(--color-on-primary-container))_100%)] px-5 py-5 text-white shadow-moon sm:px-6 sm:py-6">
      <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0))]" />
      <div className="absolute right-[-30px] top-[-34px] h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),rgba(255,255,255,0.02)_68%)]" />
      <div className="absolute bottom-[-46px] left-[-22px] h-20 w-48 rounded-t-[999px] bg-white/5 blur-2xl" />

      {ripples.map((ripple) => (
        <span
          key={`${ripple.left}-${ripple.top}`}
          className="pointer-events-none absolute rounded-full border-[5px] border-primaryFixed/45 bg-primaryFixed/10 motion-reduce:hidden"
          style={{
            left: ripple.left,
            top: ripple.top,
            width: ripple.size,
            height: ripple.size,
            animation: `ripple ${ripple.duration} linear ${ripple.delay} infinite`,
            transform: "translate(-50%, -50%) scale(0)"
          }}
        />
      ))}

      <div className="relative z-10 mt-3 max-w-[31rem]">
        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/60">Lumis Eterne</p>
        <h1 className="mt-2 text-[1.48rem] leading-[1.35] text-white sm:text-[1.6rem]">
          오늘 당신의 마음의 수면에
          <br />
          어떤 아름다운 빛이 머무르고 있나요?
        </h1>
        <p className="mt-3 text-[0.82rem] leading-6 text-white/78">
          오늘 당신의 하루를 닮은,<br />
          가장 솔직한 조각들을 가만히 들여보세요.
        </p>
      </div>
    </header>
  );
}
