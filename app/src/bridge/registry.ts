import type { BridgeRequest, BridgeResponse } from "./types";

type BridgeHandler = (params?: Record<string, unknown>) => Promise<BridgeResponse["data"]>;

const registry: Record<string, BridgeHandler> = {
  "auth.saveSecure": async (params) => params,
  "auth.clearSecure": async () => ({}),
  "push.requestPermission": async () => ({ status: "pending" }),
  "reminder.schedule": async (params) => params,
  "support.openHotline": async (params) => params,
  "external.openUrl": async (params) => params
};

export async function handleWebToAppBridge(request: BridgeRequest): Promise<BridgeResponse> {
  const handler = registry[request.command];

  if (!handler) {
    return {
      requestId: request.requestId,
      ok: false,
      error: {
        code: "UNKNOWN_COMMAND",
        message: `Unknown bridge command: ${request.command}`
      }
    };
  }

  try {
    const data = await handler(request.params);
    return {
      requestId: request.requestId,
      ok: true,
      data
    };
  } catch (error) {
    return {
      requestId: request.requestId,
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Unknown bridge error"
      }
    };
  }
}
