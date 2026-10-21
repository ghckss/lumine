import { describe, expect, it } from "vitest";
import {
  journalContentCacheKeys,
  journalDraftsCacheKey,
  journalOperationsCacheKey,
  journalRecordsCacheKey,
  LEGACY_JOURNAL_RECORDS_CACHE_KEY
} from "./journal-cache";

describe("journal cache ownership", () => {
  it("preserves owner-scoped and legacy key strings", () => {
    expect(journalRecordsCacheKey("user-1")).toBe("native.journal.records.user-1");
    expect(journalDraftsCacheKey("user-1")).toBe("journal.drafts.user-1");
    expect(journalOperationsCacheKey("user-1")).toBe("journal.operations.user-1");
    expect(LEGACY_JOURNAL_RECORDS_CACHE_KEY).toBe("native.journal.records");
    expect(journalContentCacheKeys("user-1")).toEqual([
      "native.journal.records.user-1",
      "journal.drafts.user-1",
      "journal.operations.user-1"
    ]);
  });
});
