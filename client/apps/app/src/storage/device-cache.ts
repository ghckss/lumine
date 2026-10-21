export * from "../shared/storage/device-cache";
import { journalContentCacheKeys } from "../features/journal";
import { screeningContentCacheKeys } from "../features/screening/storage/screening-cache";

export {
  journalDraftsCacheKey,
  journalOperationsCacheKey,
  journalRecordsCacheKey
} from "../features/journal/storage/journal-cache";

/** @deprecated Compose feature-owned cache keys at the application boundary. */
export function contentCacheKeys(owner: string) {
  const [records, drafts, operations] = journalContentCacheKeys(owner);
  return [records, ...screeningContentCacheKeys(owner), drafts, operations];
}
