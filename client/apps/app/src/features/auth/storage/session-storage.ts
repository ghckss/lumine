import type { LoginSession } from "../model/session";
import { getSecureValue, removeSecureValue, setSecureValue } from "../../../shared/storage/secure-store";

const SESSION_KEY = "lumine.session";

export async function saveSession(session: LoginSession) {
  await setSecureValue(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession() {
  const value = await getSecureValue(SESSION_KEY);
  if (!value) return null;

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
