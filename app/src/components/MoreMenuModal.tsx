import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { appMeta } from "../config/app-meta";
import { tokens } from "../config/tokens";

type MoreMenuModalProps = {
  visible: boolean;
  isGuest: boolean;
  onClose: () => void;
  onConnectAccount: () => void;
  onClearDeviceData: () => void;
};

type SheetType = "terms" | "privacy" | null;

const termsSections = [
  "Lumine은 사용자가 남긴 기록을 마음을 돌아보는 용도로 제공해요.",
  "앱이 제공하는 문구와 결과는 의료적 진단이나 치료를 대신하지 않아요.",
  "위험 신호가 보일 때는 앱 안내보다 전문 기관 연결을 우선해요.",
  "기기 저장 데이터를 사용하는 경우, 사용자는 언제든 직접 삭제를 요청할 수 있어요."
];

const privacySections = [
  "비회원 상태에서는 기록을 서버 DB 대신 기기 저장소에 보관해요.",
  "회원 상태에서는 서버 저장과 함께 기기 저장소에 캐시를 유지해요.",
  "계정 연동을 진행하면 기기에 남아 있던 동기화 대기 데이터를 서버와 맞춰요.",
  "기기 저장 데이터 비우기를 선택하면 앱 안에 저장된 로컬 기록과 대기 데이터가 삭제돼요."
];

export function MoreMenuModal({
  visible,
  isGuest,
  onClose,
  onConnectAccount,
  onClearDeviceData
}: MoreMenuModalProps) {
  const [sheetType, setSheetType] = useState<SheetType>(null);

  const legalTitle = useMemo(() => {
    if (sheetType === "terms") return "이용약관";
    if (sheetType === "privacy") return "개인정보 처리 안내";
    return "";
  }, [sheetType]);

  const legalSections = useMemo(() => {
    if (sheetType === "terms") return termsSections;
    if (sheetType === "privacy") return privacySections;
    return [];
  }, [sheetType]);

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <View style={styles.panel}>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>더보기</Text>
                <Text style={styles.title}>조용히 이어가기 위한 설정</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>닫기</Text>
              </Pressable>
            </View>

            <Pressable style={styles.item} onPress={onConnectAccount}>
              <View>
                <Text style={styles.itemTitle}>{isGuest ? "계정 연동하기" : "계정 연동 완료"}</Text>
                <Text style={styles.itemBody}>
                  {isGuest
                    ? "로그인이나 회원가입을 진행하고, 기기에 저장된 기록을 계정과 맞춰요."
                    : "이 기기 기록은 계정과 함께 이어지고 있어요."}
                </Text>
              </View>
            </Pressable>

            <Pressable style={styles.item} onPress={() => setSheetType("terms")}> 
              <View>
                <Text style={styles.itemTitle}>이용약관</Text>
                <Text style={styles.itemBody}>앱 이용 방식과 기본 안내를 확인해요.</Text>
              </View>
            </Pressable>

            <Pressable style={styles.item} onPress={() => setSheetType("privacy")}> 
              <View>
                <Text style={styles.itemTitle}>개인정보 처리 안내</Text>
                <Text style={styles.itemBody}>기기 저장 데이터와 계정 데이터가 어떻게 다뤄지는지 확인해요.</Text>
              </View>
            </Pressable>

            <Pressable style={styles.item} onPress={onClearDeviceData}>
              <View>
                <Text style={styles.itemTitle}>기기 저장 데이터 비우기</Text>
                <Text style={styles.itemBody}>이 기기에만 남아 있는 캐시와 대기 데이터를 지워요.</Text>
              </View>
            </Pressable>

            <View style={styles.versionBox}>
              <Text style={styles.versionLabel}>앱 버전</Text>
              <Text style={styles.versionValue}>{appMeta.version}</Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={sheetType !== null} transparent animationType="slide" onRequestClose={() => setSheetType(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheetPanel}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{legalTitle}</Text>
              <Pressable onPress={() => setSheetType(null)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>닫기</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.sheetContent}>
              {legalSections.map((section) => (
                <Text key={section} style={styles.sheetParagraph}>
                  {section}
                </Text>
              ))}

              <View style={styles.sheetMetaBox}>
                <Text style={styles.sheetMetaLabel}>최종 업데이트</Text>
                <Text style={styles.sheetMetaValue}>
                  {sheetType === "terms" ? appMeta.termsUpdatedAt : appMeta.privacyUpdatedAt}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(26, 27, 33, 0.36)",
    justifyContent: "flex-end"
  },
  panel: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: tokens.surface,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 12
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 6
  },
  eyebrow: {
    color: tokens.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5
  },
  title: {
    marginTop: 6,
    color: tokens.text,
    fontSize: 22,
    fontWeight: "700"
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: tokens.surfaceMuted
  },
  closeButtonText: {
    color: tokens.textMuted,
    fontSize: 13,
    fontWeight: "700"
  },
  item: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: tokens.surfaceMuted,
    borderWidth: 1,
    borderColor: tokens.outline
  },
  itemTitle: {
    color: tokens.text,
    fontSize: 16,
    fontWeight: "700"
  },
  itemBody: {
    marginTop: 8,
    color: tokens.textMuted,
    fontSize: 14,
    lineHeight: 22
  },
  versionBox: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: `${tokens.secondaryContainer}AA`
  },
  versionLabel: {
    color: tokens.secondary,
    fontSize: 13,
    fontWeight: "700"
  },
  versionValue: {
    color: tokens.secondary,
    fontSize: 14,
    fontWeight: "800"
  },
  sheetPanel: {
    flex: 1,
    marginTop: 72,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: tokens.surface
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: tokens.outline
  },
  sheetTitle: {
    color: tokens.text,
    fontSize: 20,
    fontWeight: "700"
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14
  },
  sheetParagraph: {
    color: tokens.textMuted,
    fontSize: 15,
    lineHeight: 24
  },
  sheetMetaBox: {
    marginTop: 10,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: tokens.surfaceMuted
  },
  sheetMetaLabel: {
    color: tokens.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  sheetMetaValue: {
    marginTop: 4,
    color: tokens.text,
    fontSize: 14,
    fontWeight: "700"
  }
});
