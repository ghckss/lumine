import type { ContentImportItem, ContentImportResult, UserDataExport } from "@lumine/api-contracts";
import type { Gender, LoginSession, UserProfile } from "@lumine/domain";
import { request } from "../../../shared/api/http-client";

export const accountApi = {
  getMe() {
    return request<UserProfile>("/api/users/me");
  },
  exportMyData() {
    return request<UserDataExport>("/api/users/me/export");
  },
  deleteMe() {
    return request<{ success: boolean }>("/api/users/me", { method: "DELETE" });
  },
  upsertProfile(payload: {
    provider: LoginSession["provider"];
    displayName: string;
    gender: Gender;
    birthDate: string;
    agreedToTerms: boolean;
  }) {
    return request<UserProfile>("/api/users/profile", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  importGuestContent(items: ContentImportItem[]) {
    return request<ContentImportResult>("/api/users/me/content-import", {
      method: "POST",
      body: JSON.stringify({ items })
    });
  }
};
