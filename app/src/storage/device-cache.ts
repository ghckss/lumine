import { getSecureValue, removeSecureValue, setSecureValue } from "./secure-store";

const CACHE_PREFIX = "lumine.device.cache:";

export function contentCacheKeys(owner: string) {
  return [
    `native.journal.records.${owner}`,
    `native.screening.results.${owner}`,
    journalDraftsCacheKey(owner),
    journalOperationsCacheKey(owner)
  ];
}

export function journalDraftsCacheKey(owner: string) {
  return `journal.drafts.${owner}`;
}

export function journalOperationsCacheKey(owner: string) {
  return `journal.operations.${owner}`;
}

function toCacheKey(key: string) {
  return `${CACHE_PREFIX}${key}`;
}

export async function saveDeviceCache<T>(key: string, value: T) {
  await setSecureValue(toCacheKey(key), JSON.stringify(value));
}

export async function loadDeviceCache<T>(key: string): Promise<T | null> {
  const rawValue = await getSecureValue(toCacheKey(key));
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    await removeSecureValue(toCacheKey(key));
    return null;
  }
}

export async function removeDeviceCache(key: string) {
  await removeSecureValue(toCacheKey(key));
}

export async function clearAllDeviceCache(keys: string[]) {
  await Promise.all(keys.map((key) => removeDeviceCache(key)));
}
