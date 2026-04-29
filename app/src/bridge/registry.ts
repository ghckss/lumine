import { Linking, PermissionsAndroid, Platform } from "react-native";
import { loadReminder, saveReminder } from "../storage/reminder-store";
import { loadDeviceCache, removeDeviceCache, saveDeviceCache } from "../storage/device-cache";
import { clearSession, setSecureValue } from "../storage/secure-store";
import type { BridgeRequest, BridgeResponse } from "./types";

type BridgeHandler = (params?: Record<string, unknown>) => Promise<BridgeResponse["data"]>;

const secureStore = new Map<string, unknown>();

class BridgeHandlerError extends Error {
  constructor(
    message: string,
    public readonly code: NonNullable<BridgeResponse["error"]>["code"]
  ) {
    super(message);
  }
}

async function openUrl(url: string) {
  const supported = await Linking.canOpenURL(url);
  if (!supported) {
    throw new Error(`Unsupported URL: ${url}`);
  }
  await Linking.openURL(url);
}

async function requestPushPermission() {
  if (Platform.OS === "android") {
    if (Platform.Version < 33) {
      return { status: "granted" as const };
    }

    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    return {
      status:
        result === PermissionsAndroid.RESULTS.GRANTED
          ? ("granted" as const)
          : result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
            ? ("blocked" as const)
            : ("denied" as const)
    };
  }

  return { status: "unsupported_in_shell" as const };
}


function parseStorageKey(params?: Record<string, unknown>) {
  const key = typeof params?.key === "string" ? params.key : null;

  if (!key) {
    throw new BridgeHandlerError("Missing storage key", "INVALID_PARAMS");
  }

  return key;
}

function parseReminderParams(params?: Record<string, unknown>) {
  const atIso = typeof params?.atIso === "string" ? params.atIso : null;
  const type = typeof params?.type === "string" ? params.type : null;

  if (!atIso || !type) {
    throw new BridgeHandlerError("Missing reminder parameters", "INVALID_PARAMS");
  }

  const scheduledAt = new Date(atIso);
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new BridgeHandlerError("Invalid reminder date", "INVALID_PARAMS");
  }

  return { atIso, type, scheduledAt };
}

const registry: Record<string, BridgeHandler> = {
  "auth.saveSecure": async (params) => {
    if (!params) {
      throw new BridgeHandlerError("Missing params", "INVALID_PARAMS");
    }

    await Promise.all(
      Object.entries(params).map(async ([key, value]) => {
        secureStore.set(key, value);
        await setSecureValue(key, JSON.stringify(value));
      })
    );

    return { savedKeys: Object.keys(params) };
  },
  "auth.clearSecure": async () => {
    secureStore.clear();
    await clearSession();
    return { cleared: true };
  },
  "push.requestPermission": async () => requestPushPermission(),
  "reminder.schedule": async (params) => {
    const { atIso, type, scheduledAt } = parseReminderParams(params);
    const key = `${type}:${scheduledAt.toISOString()}`;
    const existingReminder = await loadReminder(key);

    await saveReminder(key, {
      atIso,
      type
    });

    return {
      scheduled: true,
      reminderKey: key,
      atIso,
      type,
      existing: Boolean(existingReminder)
    };
  },
  "storage.get": async (params) => {
    const key = parseStorageKey(params);
    const value = await loadDeviceCache<unknown>(key);
    return { key, value };
  },
  "storage.set": async (params) => {
    const key = parseStorageKey(params);
    if (!("value" in (params ?? {}))) {
      throw new BridgeHandlerError("Missing storage value", "INVALID_PARAMS");
    }
    await saveDeviceCache(key, params?.value);
    return { key, saved: true };
  },
  "storage.remove": async (params) => {
    const key = parseStorageKey(params);
    await removeDeviceCache(key);
    return { key, removed: true };
  },
  "support.openHotline": async (params) => {
    const phone = typeof params?.phone === "string" ? params.phone : null;

    if (!phone) {
      throw new BridgeHandlerError("Missing phone", "INVALID_PARAMS");
    }

    await openUrl(`tel:${phone}`);
    return { opened: true, phone };
  },
  "external.openUrl": async (params) => {
    const url = typeof params?.url === "string" ? params.url : null;

    if (!url) {
      throw new BridgeHandlerError("Missing url", "INVALID_PARAMS");
    }

    if (!/^https?:\/\//.test(url)) {
      throw new BridgeHandlerError("Only http/https URLs are allowed", "POLICY_VIOLATION");
    }

    await openUrl(url);
    return { opened: true, url };
  }
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
    const message = error instanceof Error ? error.message : "Unknown bridge error";
    const code = error instanceof BridgeHandlerError ? error.code : "INTERNAL_ERROR";

    return {
      requestId: request.requestId,
      ok: false,
      error: {
        code,
        message
      }
    };
  }
}
