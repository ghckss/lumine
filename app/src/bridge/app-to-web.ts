import type { BridgeRequest } from "./types";

function createRequest(command: string, params?: Record<string, unknown>): BridgeRequest {
  return {
    requestId: `${command}:${Date.now()}`,
    command,
    params
  };
}

export function createAppToWebPayload(command: string, params?: Record<string, unknown>) {
  const payload = createRequest(command, params);
  const serialized = JSON.stringify({ type: "appToWeb", payload });

  return `
    (function() {
      const message = ${JSON.stringify(serialized)};
      window.__LUMINE_LAST_APP_EVENT__ = JSON.parse(message);
      window.dispatchEvent(new CustomEvent('appToWeb', { detail: JSON.parse(message).payload }));
      window.dispatchEvent(new MessageEvent('message', { data: message }));
    })();
    true;
  `;
}

export function createBridgeResponsePayload(response: unknown) {
  const serialized = JSON.stringify({ type: "bridgeResponse", payload: response });
  return `window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(serialized)} })); true;`;
}

const AUTH_COOKIE_NAME = "lumine_access_token";

export function createInjectedBridgeScript(accessToken?: string | null) {
  return `
(function() {
  const token = ${JSON.stringify(accessToken ?? "")};
  const cookieName = ${JSON.stringify(AUTH_COOKIE_NAME)};
  if (token) {
    document.cookie = cookieName + '=' + encodeURIComponent(token) + '; path=/; max-age=2592000; SameSite=Lax';
  } else {
    document.cookie = cookieName + '=; path=/; max-age=0; SameSite=Lax';
  }
})();
${injectedBridgeScript}
`;
}

const injectedBridgeScript = `
(function() {
  const pending = new Map();
  const BRIDGE_TIMEOUT_MS = 8000;

  window.webToApp = function(command, params) {
    const requestId = command + ':' + Date.now() + ':' + Math.random().toString(36).slice(2, 8);

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(function() {
        const handler = pending.get(requestId);
        if (!handler) {
          return;
        }
        pending.delete(requestId);
        handler.reject({ code: 'TIMEOUT', message: 'Bridge response timed out' });
      }, BRIDGE_TIMEOUT_MS);

      pending.set(requestId, { resolve, reject, timeoutId });
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'webToApp',
        payload: { requestId, command, params }
      }));
    });
  };

  window.addEventListener('message', function(event) {
    try {
      const envelope = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (!envelope || envelope.type !== 'bridgeResponse') {
        return;
      }
      const response = envelope.payload;
      const handler = pending.get(response.requestId);
      if (!handler) {
        return;
      }
      pending.delete(response.requestId);
      clearTimeout(handler.timeoutId);
      if (response.ok) {
        handler.resolve(response);
      } else {
        handler.reject(response.error || { code: 'INTERNAL_ERROR', message: 'Unknown bridge error' });
      }
    } catch (_error) {
      // Ignore malformed bridge payloads in the web shell.
    }
  });
})();
true;
`;
