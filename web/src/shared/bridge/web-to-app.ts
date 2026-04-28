import type { BridgeRequest, BridgeResponse } from "./types";

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };
  }
}

const pendingRequests = new Map<
  string,
  {
    resolve: (value: BridgeResponse) => void;
    reject: (reason?: unknown) => void;
    timeoutId: ReturnType<typeof setTimeout>;
  }
>();

const TIMEOUT_MS = 7000;

export async function webToApp(
  command: string,
  params?: Record<string, unknown>
): Promise<BridgeResponse> {
  const requestId = crypto.randomUUID();
  const payload: BridgeRequest = { requestId, command, params };

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(requestId);
      reject({
        requestId,
        ok: false,
        error: {
          code: "TIMEOUT",
          message: "Bridge response timed out"
        }
      } satisfies BridgeResponse);
    }, TIMEOUT_MS);

    pendingRequests.set(requestId, { resolve, reject, timeoutId });
    window.ReactNativeWebView?.postMessage(JSON.stringify(payload));
  });
}

export function resolveWebToApp(response: BridgeResponse) {
  const pending = pendingRequests.get(response.requestId);

  if (!pending) {
    return;
  }

  clearTimeout(pending.timeoutId);
  pendingRequests.delete(response.requestId);
  pending.resolve(response);
}
