import type { LoginSession } from "../model/session";
import { request } from "../../../shared/api/http-client";

export const authApi = {
  login(
    provider: "kakao" | "google",
    payload?: {
      providerUserId?: string;
      accessToken?: string;
      idToken?: string;
      displayName?: string;
    }
  ) {
    return request<LoginSession>(`/api/auth/login/${provider}`, {
      method: "POST",
      body: JSON.stringify(payload ?? {})
    });
  },
  logout() {
    return request<{ success: boolean }>("/api/auth/logout", { method: "POST" });
  }
};
