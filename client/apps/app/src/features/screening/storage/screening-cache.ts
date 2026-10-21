export const LEGACY_SCREENING_RESULTS_CACHE_KEY = "native.screening.results";

export function screeningResultsCacheKey(owner: string) {
  return `native.screening.results.${owner}`;
}

export function screeningContentCacheKeys(owner: string) {
  return [screeningResultsCacheKey(owner)];
}
