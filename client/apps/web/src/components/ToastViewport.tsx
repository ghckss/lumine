"use client";

import { useAtom } from "jotai";
import { useEffect } from "react";
import { toastAtom } from "@/store/lumineStore";

export function ToastViewport() {
  const [toast, setToast] = useAtom(toastAtom);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [setToast, toast]);

  return (
    <div
      className={`fixed bottom-7 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#3f2d5c] px-5 py-3 text-xs text-white shadow-xl transition duration-200 ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"}`}
      role="status"
      aria-live="polite"
    >
      {toast}
    </div>
  );
}
