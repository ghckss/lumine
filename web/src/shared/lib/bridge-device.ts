export type BootstrapMode = "unknown" | "guest" | "authenticated";

declare global {
  interface Window {
    webToApp?: (command: string, params?: Record<string, unknown>) => Promise<{ data?: unknown }>;
  }
}

async function callBridge<T>(command: string, params?: Record<string, unknown>): Promise<T | null> {
  if (typeof window === "undefined" || typeof window.webToApp !== "function") {
    return null;
  }

  const response = await window.webToApp(command, params);
  return (response?.data as T | undefined) ?? null;
}

export async function getDeviceValue<T>(key: string): Promise<T | null> {
  const data = await callBridge<{ key: string; value: T | null }>("storage.get", { key });
  return data?.value ?? null;
}

export async function setDeviceValue<T>(key: string, value: T) {
  await callBridge("storage.set", { key, value });
}

export async function removeDeviceValue(key: string) {
  await callBridge("storage.remove", { key });
}
