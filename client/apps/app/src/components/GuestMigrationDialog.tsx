import React from "react";
import { GuestMigrationDialog as AuthGuestMigrationDialog } from "../features/auth/ui/GuestMigrationDialog";
import { useApp } from "../context/AppContext";

/** @deprecated Compose auth UI navigation in app/AppRoot instead. */
export function GuestMigrationDialog() {
  const { navigate } = useApp();
  return <AuthGuestMigrationDialog onRequestSafetyHelp={() => navigate("safety-help")} />;
}
