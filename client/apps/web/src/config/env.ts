const configuredApiBaseUrl = process.env.NEXT_PUBLIC_LUMINE_API_BASE_URL?.trim().replace(/\/$/, "");

export const API_BASE_URL = configuredApiBaseUrl ?? "";
export const isApiConfigured = API_BASE_URL.length > 0;
