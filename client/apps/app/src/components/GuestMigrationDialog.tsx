import React from "react";
import { useNavigation } from "../app/navigation";
import { GuestMigrationDialog as AuthGuestMigrationDialog } from "../features/auth/ui/GuestMigrationDialog";

/** @deprecated Compose auth UI navigation in app/AppRoot instead. */
export function GuestMigrationDialog() {
  const { navigate } = useNavigation();
  return <AuthGuestMigrationDialog onRequestSafetyHelp={() => navigate("safety-help")} />;
}
