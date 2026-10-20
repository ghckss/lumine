import { ApiError } from "@lumine/api-contracts";
import { API_BASE_URL } from "../config/env";

type ApiEnvelope<T> = { data: T };

let accessToken: string | null = null;

export function configureApiAccessToken(token: string | null) {
  accessToken = token;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) throw new ApiError(response.status);

  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}
