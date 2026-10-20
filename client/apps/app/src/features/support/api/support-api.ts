import { request } from "../../../shared/api/http-client";

export const supportApi = {
  getSupportResources() {
    return request<Array<{ code: string; title: string; phone: string; description: string }>>(
      "/api/support/resources"
    );
  }
};
