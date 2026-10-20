"use client";

import { Provider } from "jotai";
import type { ReactNode } from "react";
import { StorageHydrator } from "@/components/StorageHydrator";
import { ToastViewport } from "@/components/ToastViewport";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <StorageHydrator />
      {children}
      <ToastViewport />
    </Provider>
  );
}
