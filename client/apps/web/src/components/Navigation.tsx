"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";
import type { Route } from "@/lib/Constants";

const navItems: Array<[Route, string, string, string]> = [
  ["home", "/", "⌂", "홈"],
  ["journal", "/journal", "✎", "감정 일기"],
  ["records", "/records", "◫", "기록"],
  ["check", "/check", "♡", "마음 확인"],
  ["report", "/report", "⌁", "마음 리포트"],
];

export const Navigation = memo(function Navigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const visible = mobile
    ? navItems
    : [...navItems, ["settings", "/settings", "···", "설정"] as [Route, string, string, string]];

  if (mobile) {
    return (
      <nav
        className="fixed right-2.5 bottom-2 left-2.5 z-40 hidden grid-cols-5 rounded-[20px] border border-[#e5ddf3]/90 bg-white/90 p-1.5 shadow-xl backdrop-blur-xl max-sm:grid"
        aria-label="주요 메뉴"
      >
        {visible.map(([route, href, icon, label]) => (
          <Link
            key={route}
            href={href}
            className={`grid justify-items-center gap-0.5 px-0.5 py-1 text-[9px] no-underline ${pathname === href ? "font-extrabold text-[#72559d]" : "text-[#9b91a8]"}`}
            aria-current={pathname === href ? "page" : undefined}
          >
            <span className="text-[17px]" aria-hidden="true">
              {icon}
            </span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="grid gap-2" aria-label="주요 메뉴">
      {visible.map(([route, href, icon, label]) => (
        <Link
          key={route}
          href={href}
          className={`flex w-full items-center gap-3 rounded-[14px] px-3.5 py-3 text-left font-semibold no-underline transition hover:translate-x-0.5 hover:bg-[#eee7ff]/65 hover:text-[#3f2d5c] ${pathname === href ? "bg-[#eee7ff] text-[#3f2d5c] shadow-[inset_0_0_0_1px_rgba(114,85,157,.06)]" : "text-[#746985]"}`}
          aria-current={pathname === href ? "page" : undefined}
        >
          <span className="w-6 text-center text-[17px]" aria-hidden="true">
            {icon}
          </span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
});
