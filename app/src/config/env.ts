import { Platform } from "react-native";

const LOCAL_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const configuredApiBaseUrl = process.env.LUMINE_API_BASE_URL?.trim().replace(/\/$/, "");

if (!__DEV__ && !configuredApiBaseUrl?.startsWith("https://")) {
  throw new Error("Release builds require an HTTPS LUMINE_API_BASE_URL.");
}

export const API_BASE_URL = configuredApiBaseUrl || `http://${LOCAL_HOST}:8080`;
