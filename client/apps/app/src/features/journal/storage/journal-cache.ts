export const LEGACY_JOURNAL_RECORDS_CACHE_KEY = "native.journal.records";

export function journalRecordsCacheKey(owner: string) {
  return `native.journal.records.${owner}`;
}

export function journalDraftsCacheKey(owner: string) {
  return `journal.drafts.${owner}`;
}

export function journalOperationsCacheKey(owner: string) {
  return `journal.operations.${owner}`;
}

export function journalContentCacheKeys(owner: string) {
  return [
    journalRecordsCacheKey(owner),
    journalDraftsCacheKey(owner),
    journalOperationsCacheKey(owner)
  ];
}
