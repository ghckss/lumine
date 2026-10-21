import type { ScreeningHistoryItem, ScreeningPayload } from "@lumine/api-contracts";
import type { ScreeningQuestionnaire, ScreeningResult } from "../model/screening";
import { request } from "../../../shared/api/http-client";

export const screeningApi = {
  submitScreening(payload: ScreeningPayload) {
    return request<Omit<ScreeningResult, "id" | "completedDate">>("/api/screening/submissions", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  getScreeningQuestionnaire() {
    return request<ScreeningQuestionnaire>("/api/screening/questionnaire");
  },
  getScreeningHistory() {
    return request<ScreeningHistoryItem[]>("/api/screening/history");
  }
};
