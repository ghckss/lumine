import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { appMeta } from "../../../shared/config/app-meta";
import { tokens } from "../../../shared/theme/tokens";
import { Card, Page, PageScroll, PrimaryButton, typography } from "../../../shared/ui";
import { exportUserDataFile } from "../services/data-export";

type MenuProps = {
  isGuest: boolean;
  displayName?: string;
  journalCount: number;
  screeningCount: number;
  syncBadge: string;
  header: React.ReactNode;
  onRequestLogin: () => void;
  onRequestGuestMigration: () => void;
  onOpenDataManagement: () => void;
  onOpenSafetyHelp: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  onLogout: () => void;
};

export function MenuScreen({ isGuest, displayName, journalCount, screeningCount, syncBadge, header, onRequestLogin, onRequestGuestMigration, onOpenDataManagement, onOpenSafetyHelp, onOpenTerms, onOpenPrivacy, onLogout }: MenuProps) {
  const profile = <Card style={styles.profileCard}><View style={styles.avatar}><Text style={styles.avatarText}>{(isGuest ? "G" : displayName?.slice(0, 1)) ?? "L"}</Text></View><View style={styles.flex}><Text style={styles.profileName}>{isGuest ? "게스트" : displayName ?? "루민"}</Text><Text style={typography.caption}>{isGuest ? "로그인하면 기록을 안전하게 보관할 수 있어요" : `기록 ${journalCount}개 · 마음 확인 ${screeningCount}회`}</Text></View>{isGuest ? <Text style={styles.arrow}>›</Text> : null}</Card>;

  return (
    <Page>
      {header}
      <PageScroll>
        {isGuest ? <Pressable accessibilityRole="button" accessibilityLabel="로그인 화면으로 이동" onPress={onRequestLogin} style={({ pressed }) => pressed && styles.pressed}>{profile}</Pressable> : profile}
        {!isGuest ? <MenuSection title="데이터" items={[{ icon: "↻", label: "게스트 기록 동기화", badge: syncBadge, action: onRequestGuestMigration }, { icon: "🗂️", label: "내 데이터 관리", action: onOpenDataManagement }]} /> : null}
        <MenuSection title="서비스" items={[{ icon: "🛡️", label: "도움 요청", action: onOpenSafetyHelp }, { icon: "📖", label: "이용약관", action: onOpenTerms }, { icon: "🔒", label: "개인정보처리방침", action: onOpenPrivacy }]} />
        <MenuSection title="앱 정보" items={[{ icon: "📱", label: "앱 버전", badge: `v${appMeta.version}` }]} />
        {!isGuest ? <View style={styles.logout}><PrimaryButton variant="outline" label="로그아웃" onPress={onLogout} /></View> : null}
      </PageScroll>
    </Page>
  );
}

export function DataManagementScreen({ header, onDeleteAccount }: { header: React.ReactNode; onDeleteAccount: () => Promise<void> }) {
  const [status, setStatus] = React.useState<"idle" | "exporting" | "deleting">("idle");
  const [message, setMessage] = React.useState<string | null>(null);

  async function exportData() {
    setStatus("exporting");
    setMessage(null);
    try {
      await exportUserDataFile();
      setMessage("JSON 파일을 만들었습니다. 공유하거나 파일 앱에 저장할 수 있어요.");
    } catch {
      setMessage("파일을 만들지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setStatus("idle");
    }
  }

  function confirmDelete() {
    Alert.alert(
      "Lumine 계정을 탈퇴할까요?",
      "서버에 저장된 일기와 마음 확인 결과가 모두 삭제되며 복구할 수 없습니다. 카카오·Google 계정은 삭제되지 않습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "모든 데이터 삭제 후 탈퇴",
          style: "destructive",
          onPress: () => {
            setStatus("deleting");
            setMessage(null);
            void onDeleteAccount().catch(() => {
              setMessage("계정을 삭제하지 못했습니다. 네트워크를 확인하고 다시 시도해주세요.");
              setStatus("idle");
            });
          }
        }
      ]
    );
  }

  return (
    <Page>
      {header}
      <PageScroll>
        <Card style={styles.dataCard}>
          <Text style={typography.section}>내 기록 내보내기</Text>
          <Text style={[typography.muted, styles.dataDescription]}>프로필, 일기, 마음 확인 결과를 읽을 수 있는 UTF-8 JSON 파일로 저장합니다.</Text>
          <PrimaryButton label={status === "exporting" ? "파일 만드는 중…" : "JSON 파일 내보내기"} disabled={status !== "idle"} onPress={() => void exportData()} />
        </Card>
        <Card style={styles.dataCard}>
          <Text style={[typography.section, styles.dangerText]}>계정 탈퇴 및 서버 데이터 삭제</Text>
          <Text style={[typography.muted, styles.dataDescription]}>Lumine 서버의 계정과 기록을 영구 삭제합니다. 연결된 소셜 계정에는 영향을 주지 않습니다.</Text>
          <PrimaryButton variant="danger" label={status === "deleting" ? "삭제하는 중…" : "계정 탈퇴"} disabled={status !== "idle"} onPress={confirmDelete} />
        </Card>
        {message ? <Text style={[typography.muted, styles.dataMessage]}>{message}</Text> : null}
      </PageScroll>
    </Page>
  );
}

function MenuSection({ title, items }: { title: string; items: Array<{ icon: string; label: string; badge?: string; danger?: boolean; action?: () => void }> }) {
  return <View style={styles.menuSection}><Text style={styles.menuSectionTitle}>{title}</Text><View style={styles.menuCard}>{items.map((item, index) => <Pressable key={item.label} disabled={!item.action} onPress={item.action} style={({ pressed }) => [styles.menuItem, index < items.length - 1 && styles.menuDivider, pressed && styles.pressed]}><Text style={styles.menuItemIcon}>{item.icon}</Text><Text style={[styles.menuItemLabel, item.danger && styles.dangerText]}>{item.label}</Text>{item.badge ? <View style={[styles.badge, item.danger && styles.dangerBadge]}><Text style={[styles.badgeText, item.danger && styles.dangerText]}>{item.badge}</Text></View> : null}{item.action ? <Text style={styles.arrow}>›</Text> : null}</Pressable>)}</View></View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  arrow: { color: tokens.outline, fontSize: 25 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 24, marginTop: 4 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: tokens.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: tokens.white, fontFamily: "serif", fontSize: 21, fontWeight: "700" },
  profileName: { color: tokens.text, fontSize: 15, fontWeight: "700", marginBottom: 3 },
  menuSection: { marginBottom: 20 },
  menuSectionTitle: { color: tokens.textMuted, fontSize: 10, fontWeight: "700", letterSpacing: 2, marginLeft: 4, marginBottom: 8 },
  menuCard: { backgroundColor: tokens.white, borderWidth: 1, borderColor: tokens.outline, borderRadius: 18, overflow: "hidden" },
  menuItem: { minHeight: 54, flexDirection: "row", alignItems: "center", paddingHorizontal: 15, gap: 11 },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: tokens.outline },
  menuItemIcon: { fontSize: 18 },
  menuItemLabel: { flex: 1, color: tokens.text, fontSize: 14, fontWeight: "600" },
  badge: { backgroundColor: tokens.primaryLight, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: tokens.primary, fontSize: 10, fontWeight: "600" },
  dangerBadge: { backgroundColor: tokens.dangerLight },
  dangerText: { color: tokens.danger },
  logout: { marginTop: 2 },
  dataCard: { marginTop: 12 },
  dataDescription: { marginTop: 7, marginBottom: 16 },
  dataMessage: { marginTop: 16, textAlign: "center" },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] }
});
