import { Platform } from "react-native";

const LOCAL_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";

export const API_BASE_URL = `http://${LOCAL_HOST}:8080`;
