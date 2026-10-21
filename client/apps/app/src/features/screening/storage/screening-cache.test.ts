import { describe, expect, it } from "vitest";
import {
  LEGACY_SCREENING_RESULTS_CACHE_KEY,
  screeningContentCacheKeys,
  screeningResultsCacheKey
} from "./screening-cache";

describe("screening cache ownership", () => {
  it("preserves owner-scoped and legacy key strings", () => {
    expect(screeningResultsCacheKey("user-1")).toBe("native.screening.results.user-1");
    expect(screeningContentCacheKeys("user-1")).toEqual(["native.screening.results.user-1"]);
    expect(LEGACY_SCREENING_RESULTS_CACHE_KEY).toBe("native.screening.results");
  });
});
