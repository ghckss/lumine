"use client";

import { useEffect, useRef, useState } from "react";

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
};

export function HomeHeroSection() {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const rippleIdRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const createRippleGroup = () => {
      const area = areaRef.current;
      if (!area) return;

      const { width, height } = area.getBoundingClientRect();
      const x = Math.random() * width;
      const y = Math.random() * height;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(width - x, y),
        Math.hypot(x, height - y),
        Math.hypot(width - x, height - y),
      );
      const size = maxDistance * 2;
      const count = Math.random() > 0.5 ? 2 : 1;
      const nextRipples: Ripple[] = Array.from({ length: count }, (_, index) => ({
        id: rippleIdRef.current++,
        x,
        y,
        size,
        delay: index * 0.2,
      }));

      setRipples((prev) => [...prev, ...nextRipples]);

      window.setTimeout(() => {
        setRipples((prev) =>
          prev.filter((ripple) => !nextRipples.some((next) => next.id === ripple.id)),
        );
      }, 5400);

      timeoutRef.current = window.setTimeout(createRippleGroup, 5000 + Math.random() * 1800);
    };

    createRippleGroup();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <header ref={areaRef} className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary)_88%,black),color-mix(in_srgb,var(--color-primary)_62%,var(--color-on-primary-container))_100%)] px-5 py-5 text-white shadow-moon sm:px-6 sm:py-6">
      <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0))]" />
      <div className="absolute right-[-30px] top-[-34px] h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22),rgba(255,255,255,0.02)_68%)]" />
      <div className="absolute bottom-[-46px] left-[-22px] h-20 w-48 rounded-t-[999px] bg-white/5 blur-2xl" />

      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute rounded-full border-[5px] order-primaryFixed/70 bg-primaryFixed/20 bg-transparent"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            animation: `ripple 5s linear ${ripple.delay}s both`,
            transform: "translate(-50%, -50%) scale(0)",
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
