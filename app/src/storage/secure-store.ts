import type { LoginSession } from "../types/session";

const memoryStore = new Map<string, string>();
const SESSION_KEY = "lumine.session";

type KeychainModule = {
  setInternetCredentials: (server: string, username: string, password: string) => Promise<void>;
  getInternetCredentials: (
    server: string
  ) => Promise<false | { username: string; password: string }>;
  resetInternetCredentials: (server: string) => Promise<void>;
};

let cachedKeychain: KeychainModule | null | undefined;

function getKeychain(): KeychainModule | null {
  if (cachedKeychain !== undefined) {
    return cachedKeychain;
  }

  try {
    cachedKeychain = require("react-native-keychain") as KeychainModule;
  } catch {
    cachedKeychain = null;
  }

  return cachedKeychain;
}

export async function setSecureValue(key: string, value: string) {
  const keychain = getKeychain();
  if (keychain) {
    await keychain.setInternetCredentials(`lumine:${key}`, key, value);
  }
  memoryStore.set(key, value);
}

export async function getSecureValue(key: string) {
  const keychain = getKeychain();
  if (keychain) {
    const credentials = await keychain.getInternetCredentials(`lumine:${key}`);
    if (credentials) {
      memoryStore.set(key, credentials.password);
      return credentials.password;
    }
  }

  return memoryStore.get(key) ?? null;
}

export async function removeSecureValue(key: string) {
  const keychain = getKeychain();
  if (keychain) {
    await keychain.resetInternetCredentials(`lumine:${key}`);
  }
  memoryStore.delete(key);
}

export async function saveSession(session: LoginSession) {
  await setSecureValue(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession() {
  const value = await getSecureValue(SESSION_KEY);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as LoginSession;
  } catch {
    await removeSecureValue(SESSION_KEY);
    return null;
  }
}

export async function clearSession() {
  await removeSecureValue(SESSION_KEY);
}
