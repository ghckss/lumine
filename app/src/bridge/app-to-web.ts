import type { BridgeResponse } from "./types";

export async function appToWeb(
  command: string,
  params?: Record<string, unknown>
): Promise<BridgeResponse> {
  return {
    requestId: `${command}:${Date.now()}`,
    ok: true,
    data: params
  };
}
