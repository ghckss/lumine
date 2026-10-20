import React from "react";
import { SessionProvider as FeatureSessionProvider } from "../features/auth/model/SessionProvider";
import { sessionServices } from "../app/bootstrap/session-services";

export { useSession } from "../features/auth/model/SessionProvider";
export type { GuestMigrationState, SessionServices } from "../features/auth/model/SessionProvider";

/** @deprecated App composition now lives in app/providers/AppProviders. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <FeatureSessionProvider services={sessionServices}>{children}</FeatureSessionProvider>;
}
