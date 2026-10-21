import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "../../shared/theme/tokens";
import { useNavigation } from "./NavigationProvider";

export function TopBar({ title, showBack = true, showMenu = false, onBack }: { title?: string; showBack?: boolean; showMenu?: boolean; onBack?: () => void }) {
  const { goBack, navigate } = useNavigation();
  return (
    <View style={styles.topBar}>
      <View style={styles.topSlot}>
        {showBack ? <Pressable accessibilityRole="button" accessibilityLabel="뒤로가기" onPress={onBack ?? goBack} style={styles.iconButton}><Text style={styles.backIcon}>‹</Text></Pressable> : null}
      </View>
      <Text style={styles.topTitle}>{title}</Text>
      <View style={[styles.topSlot, styles.topSlotRight]}>
        {showMenu ? <Pressable accessibilityRole="button" accessibilityLabel="메뉴" onPress={() => navigate("menu")} style={styles.iconButton}><Text style={styles.menuIcon}>•••</Text></Pressable> : null}
      </View>
    </View>
  );
}

export function BottomTabs() {
  const { route, resetTo } = useNavigation();
  const tabs = [
    { page: "home" as const, label: "홈", icon: "⌂" },
    { page: "records" as const, label: "내 마음기록", icon: "▤" }
  ];
  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => {
        const active = route.page === tab.page || (tab.page === "records" && route.page === "record-detail");
        return (
          <Pressable key={tab.page} onPress={() => resetTo(tab.page)} style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
            <Text style={[styles.tabIcon, active && styles.tabActive]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, active && styles.tabActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 },
  topSlot: { width: 44, alignItems: "flex-start" },
  topSlotRight: { alignItems: "flex-end" },
  topTitle: { fontFamily: "serif", fontSize: 16, fontWeight: "700", color: tokens.text },
  iconButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  backIcon: { color: tokens.primary, fontSize: 34, lineHeight: 36, fontWeight: "300" },
  menuIcon: { color: tokens.primary, fontSize: 16, letterSpacing: 1 },
  tabs: { flexDirection: "row", backgroundColor: tokens.white, borderTopWidth: 1, borderTopColor: tokens.outline },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 62, gap: 2 },
  tabIcon: { fontSize: 23, lineHeight: 25, color: tokens.tabMuted },
  tabLabel: { fontSize: 10, fontWeight: "600", color: tokens.tabMuted },
  tabActive: { color: tokens.primary },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] }
});
