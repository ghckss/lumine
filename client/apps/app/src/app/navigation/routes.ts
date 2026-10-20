export type PageName =
  | "home"
  | "check-start"
  | "check-question"
  | "check-result"
  | "safety-result"
  | "diary"
  | "records"
  | "record-detail"
  | "mind-report"
  | "safety-help"
  | "menu"
  | "data-management"
  | "terms"
  | "privacy";

export type AppRoute = { key: string; page: PageName; params?: Record<string, unknown> };
