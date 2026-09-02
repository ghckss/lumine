import React from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "../config/tokens";
import { useSession } from "../context/SessionContext";
import { PrimaryButton, typography } from "./NativeUI";
import { useApp } from "../context/AppContext";

export function GuestMigrationDialog() {
  const { guestMigration, startGuestMigration, dismissGuestMigration } = useSession();
  const { navigate } = useApp();
  const visible = ["prompt", "syncing", "completed", "needs_attention"].includes(guestMigration.phase);

  function openSafetyHelp() {
    dismissGuestMigration();
    navigate("safety-help");
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismissGuestMigration}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          {guestMigration.phase === "prompt" ? (
            <>
              <Text style={typography.title}>게스트 기록을 옮길까요?</Text>
              <Text style={[typography.muted, styles.description]}>
                이 기기에 저장된 기록 {guestMigration.totalCount}개를 현재 계정으로 이전합니다. 이전하지 않아도 기기 기록은 그대로 유지되며, 메뉴에서 다시 시도할 수 있어요.
              </Text>
              <PrimaryButton label="계정으로 이전하기" onPress={() => void startGuestMigration()} />
              <View style={styles.secondary}><PrimaryButton variant="outline" label="지금은 이전하지 않기" onPress={dismissGuestMigration} /></View>
            </>
          ) : null}

          {guestMigration.phase === "syncing" ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={tokens.primary} />
              <Text style={typography.section}>기록을 안전하게 옮기고 있어요</Text>
              <Text style={typography.muted}>총 {guestMigration.totalCount}개 기록을 확인하는 중입니다.</Text>
            </View>
          ) : null}

          {guestMigration.phase === "completed" ? (
            <>
              <Text style={typography.title}>기록 이전을 완료했어요</Text>
              <Text style={[typography.muted, styles.description]}>{guestMigration.syncedCount}개 기록이 현재 계정에 안전하게 저장되었습니다.</Text>
              <PrimaryButton label="확인" onPress={dismissGuestMigration} />
            </>
          ) : null}

          {guestMigration.phase === "needs_attention" ? (
            <>
              <Text style={typography.title}>일부 기록을 확인해주세요</Text>
              <Text style={[typography.muted, styles.description]}>
                {guestMigration.syncedCount}개 완료 · {guestMigration.conflictCount}개 날짜 충돌 · {guestMigration.failedCount}개 실패
                {"\n"}옮기지 못한 기록은 기기에 남아 있으며 메뉴에서 다시 시도할 수 있어요.
              </Text>
              {guestMigration.failedCount > 0 ? <PrimaryButton label="실패한 기록 다시 시도" onPress={() => void startGuestMigration()} /> : null}
              <View style={guestMigration.failedCount > 0 ? styles.secondary : undefined}><PrimaryButton variant="outline" label="닫기" onPress={dismissGuestMigration} /></View>
            </>
          ) : null}
          <Pressable accessibilityRole="button" onPress={openSafetyHelp} style={styles.safetyLink}>
            <Text style={styles.safetyText}>지금 긴급한 도움이 필요해요</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(26,20,48,0.42)", alignItems: "center", justifyContent: "center", padding: 24 },
  dialog: { width: "100%", maxWidth: 420, borderRadius: 22, backgroundColor: tokens.white, padding: 22 },
  description: { marginTop: 10, marginBottom: 20 },
  secondary: { marginTop: 10 },
  centered: { alignItems: "center", gap: 12, paddingVertical: 16 },
  safetyLink: { alignItems: "center", paddingTop: 18, paddingBottom: 2 },
  safetyText: { color: tokens.danger, fontSize: 13, fontWeight: "700" }
});
