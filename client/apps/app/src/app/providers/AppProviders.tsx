import React from "react";
import { SessionProvider } from "../../features/auth/model/SessionProvider";
import { sessionServices } from "../bootstrap/session-services";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider services={sessionServices}>{children}</SessionProvider>;
}
