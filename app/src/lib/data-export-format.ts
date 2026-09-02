import type { UserDataExport } from "./api";

export function serializeUserDataExport(data: UserDataExport) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

export function createUserDataExportFileName(now = new Date()) {
  const timestamp = now.toISOString().replace(/[:.]/g, "-");
  return `lumine-data-${timestamp}.json`;
}
