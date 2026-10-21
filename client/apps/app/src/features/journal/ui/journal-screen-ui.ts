import { StyleSheet } from "react-native";
import { tokens } from "../../../shared/theme/tokens";
import { typography } from "../../../shared/ui";

export function localIsoDay() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function syncLabel(status: "local" | "pending" | "failed" | "conflict") {
  if (status === "local") return "기기에만 저장";
  if (status === "pending") return "동기화 대기";
  if (status === "conflict") return "변경 충돌";
  return "동기화 실패";
}

export const styles = StyleSheet.create({
  diaryTitle: { marginTop: 3 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 22 },
  customRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  customInput: { flex: 1, minHeight: 44, backgroundColor: tokens.white, borderRadius: 22, borderWidth: 1, borderColor: tokens.outline, paddingHorizontal: 15, color: tokens.text },
  addButton: { minWidth: 64, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: tokens.primary },
  addText: { color: tokens.primary, fontWeight: "700" },
  fieldLabel: { fontSize: 14, fontWeight: "700", color: tokens.text, marginTop: 26, marginBottom: 9 },
  diaryInput: { minHeight: 170, borderRadius: 18, borderWidth: 1, borderColor: tokens.outline, backgroundColor: tokens.white, padding: 15, color: tokens.text, fontSize: 14, lineHeight: 22 },
  counter: { ...typography.caption, textAlign: "right", marginTop: 5 },
  notice: { backgroundColor: tokens.primaryLight, borderWidth: 1, borderColor: tokens.outline, padding: 12, borderRadius: 12, marginTop: 12 },
  noticeText: { ...typography.caption, color: tokens.primaryDark },
  errorNotice: { backgroundColor: "#FFF1F1", borderWidth: 1, borderColor: tokens.danger, padding: 12, borderRadius: 12, marginTop: 12, gap: 6 },
  errorText: { ...typography.caption, color: tokens.danger },
  retryText: { color: tokens.primary, fontSize: 13, fontWeight: "700", paddingVertical: 3 },
  bottomAction: { paddingHorizontal: 20, paddingBottom: 12 },
  overlay: { flex: 1, backgroundColor: "rgba(82,62,114,0.96)", alignItems: "center", justifyContent: "center", paddingHorizontal: 34 },
  overlayMark: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  overlayCheck: { color: tokens.white, fontSize: 40 },
  overlayTitle: { ...typography.title, color: tokens.white, marginTop: 18 },
  overlayChips: { flexDirection: "row", gap: 6, marginTop: 13 },
  overlayChip: { backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
  overlayChipText: { color: tokens.white, fontSize: 12 },
  overlayMessage: { color: "rgba(255,255,255,0.9)", fontSize: 14, lineHeight: 22, textAlign: "center", marginTop: 18 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30, paddingVertical: 70 },
  emptyEmoji: { fontSize: 44, marginBottom: 12 },
  detailChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 20 },
  detailCard: { marginBottom: 22 },
  comfortLabel: { color: tokens.textMuted, marginBottom: 9 },
  comfortCard: { flexDirection: "row", gap: 12, alignItems: "flex-start", backgroundColor: tokens.primaryLight, borderWidth: 1, borderColor: tokens.outline, borderRadius: 18, padding: 17 },
  comfortText: { flex: 1, color: tokens.primaryDark, fontSize: 14, lineHeight: 22 },
  editButton: { marginTop: 24 },
  deleteButton: { marginTop: 12, marginBottom: 20 },
  syncNotice: { backgroundColor: tokens.primaryLight, borderRadius: 14, borderWidth: 1, borderColor: tokens.outline, padding: 13, marginTop: 16, gap: 4 },
  syncNoticeTitle: { color: tokens.primaryDark, fontSize: 13, fontWeight: "700" },
  actionError: { color: tokens.danger, fontSize: 12, marginTop: 8 }
});
