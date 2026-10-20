import type { ReactNode } from "react";

export function PageHead({
  kicker,
  title,
  subtitle,
  action,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <header className="mt-4 mb-7 flex items-end justify-between gap-6 max-sm:mt-3 max-sm:mb-5 max-sm:items-start">
      <div>
        <div className="text-[11px] font-extrabold tracking-[.12em] text-[#72559d] uppercase">
          {kicker}
        </div>
        <h1 className="mt-1 font-serif text-[clamp(26px,3vw,38px)] leading-tight font-bold tracking-[-.04em] text-[#211934] max-sm:text-[27px]">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-7 text-[#746985] max-sm:text-xs">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}
