export * from "../shared/storage/device-cache";
import { journalContentCacheKeys } from "../features/journal/storage/journal-cache";

export {
  journalDraftsCacheKey,
  journalOperationsCacheKey,
  journalRecordsCacheKey
} from "../features/journal/storage/journal-cache";

/** @deprecated Compose feature-owned cache keys at the application boundary. */
export function contentCacheKeys(owner: string) {
  const [records, drafts, operations] = journalContentCacheKeys(owner);
  return [records, `native.screening.results.${owner}`, drafts, operations];
}
