"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { setApiAccessToken } from "@/shared/lib/api";
import { BridgeBootstrapProvider, useBridgeBootstrap } from "@/shared/hooks/useBridgeBootstrap";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <BridgeBootstrapProvider>
        <BootstrapSessionSync>{children}</BootstrapSessionSync>
      </BridgeBootstrapProvider>
    </QueryClientProvider>
  );
}

function BootstrapSessionSync({ children }: { children: React.ReactNode }) {
  const bootstrap = useBridgeBootstrap();

  useEffect(() => {
    setApiAccessToken(bootstrap.mode === "authenticated" ? bootstrap.accessToken : null);
  }, [bootstrap.accessToken, bootstrap.mode]);

  return <>{children}</>;
}
