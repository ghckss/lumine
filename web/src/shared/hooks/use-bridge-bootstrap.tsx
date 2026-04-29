"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { BootstrapMode } from "@/shared/lib/bridge-device";

type BootstrapState = {
  mode: BootstrapMode;
  displayName: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  provider: string | null;
  ready: boolean;
};

const BootstrapContext = createContext<BootstrapState>({
  mode: "unknown",
  displayName: null,
  accessToken: null,
  refreshToken: null,
  userId: null,
  provider: null,
  ready: false
});

export function BridgeBootstrapProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BootstrapState>({
    mode: "unknown",
    displayName: null,
    accessToken: null,
    refreshToken: null,
    userId: null,
    provider: null,
    ready: false
  });

  useEffect(() => {
    let settled = false;
    const browserTimer = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        setState({
          mode: "guest",
          displayName: null,
          accessToken: null,
          refreshToken: null,
          userId: null,
          provider: null,
          ready: true
        });
      }
    }, 250);

    function handlePayload(payload: unknown) {
      if (!payload || typeof payload !== "object") {
        return;
      }
      const eventPayload = payload as { command?: string; params?: Record<string, unknown> };
      if (eventPayload.command !== "auth.bootstrap") {
        return;
      }

      settled = true;
      window.clearTimeout(browserTimer);
      const status = typeof eventPayload.params?.status === "string" ? eventPayload.params.status : "guest";
      setState({
        mode: status === "ok" ? "authenticated" : "guest",
        displayName: typeof eventPayload.params?.displayName === "string" ? eventPayload.params.displayName : null,
        accessToken: typeof eventPayload.params?.accessToken === "string" ? eventPayload.params.accessToken : null,
        refreshToken: typeof eventPayload.params?.refreshToken === "string" ? eventPayload.params.refreshToken : null,
        userId: typeof eventPayload.params?.userId === "string" ? eventPayload.params.userId : null,
        provider: typeof eventPayload.params?.provider === "string" ? eventPayload.params.provider : null,
        ready: true
      });
    }

    function handleCustomEvent(event: Event) {
      const customEvent = event as CustomEvent;
      handlePayload(customEvent.detail);
    }

    function handleMessage(event: MessageEvent) {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type === "appToWeb") {
          handlePayload(data.payload);
        }
      } catch {
        // ignore
      }
    }

    window.addEventListener("appToWeb", handleCustomEvent);
    window.addEventListener("message", handleMessage);

    return () => {
      window.clearTimeout(browserTimer);
      window.removeEventListener("appToWeb", handleCustomEvent);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const value = useMemo(() => state, [state]);
  return <BootstrapContext.Provider value={value}>{children}</BootstrapContext.Provider>;
}

export function useBridgeBootstrap() {
  return useContext(BootstrapContext);
}
