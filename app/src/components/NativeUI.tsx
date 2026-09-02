import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { tokens } from "../config/tokens";
import { useApp } from "../context/AppContext";
import { getEmotionColor } from "../types/content";

export const typography = StyleSheet.create({
  hero: { fontFamily: "serif", fontSize: 28, lineHeight: 36, fontWeight: "700", color: tokens.text },
  title: { fontFamily: "serif", fontSize: 21, lineHeight: 29, fontWeight: "700", color: tokens.text },
  section: { fontFamily: "serif", fontSize: 16, lineHeight: 23, fontWeight: "700", color: tokens.text },
  body: { fontSize: 14, lineHeight: 22, color: tokens.text },
  muted: { fontSize: 13, lineHeight: 20, color: tokens.textMuted },
  caption: { fontSize: 11, lineHeight: 16, color: tokens.textMuted }
});

export function Page({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.page, style]}>{children}</View>;
}

export function PageScroll({ children, contentStyle }: { children: React.ReactNode; contentStyle?: StyleProp<ViewStyle> }) {
  return <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, contentStyle]} showsVerticalScrollIndicator={false}>{children}</ScrollView>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Logo({ size = 80 }: { size?: number }) {
  return (
    <View style={[styles.logoOuter, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.logoMiddle, { width: size * 0.68, height: size * 0.68, borderRadius: size }]}>
        <View style={[styles.logoCore, { width: size * 0.4, height: size * 0.4, borderRadius: size }]}>
          <View style={[styles.logoLight, { width: size * 0.14, height: size * 0.14, borderRadius: size }]} />
        </View>
      </View>
    </View>
  );
}

export function TopBar({ title, showBack = true, showMenu = false, onBack }: { title?: string; showBack?: boolean; showMenu?: boolean; onBack?: () => void }) {
  const { goBack, navigate } = useApp();
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

export function PrimaryButton({ label, onPress, disabled = false, variant = "primary" }: { label: string; onPress: () => void; disabled?: boolean; variant?: "primary" | "outline" | "danger" }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [
      styles.button,
      variant === "outline" && styles.outlineButton,
      variant === "danger" && styles.dangerButton,
      disabled && styles.disabledButton,
      pressed && !disabled && styles.pressed
    ]}>
      <Text style={[styles.buttonText, variant === "outline" && styles.outlineButtonText, disabled && styles.disabledText]}>{label}</Text>
    </Pressable>
  );
}

export function EmotionChip({ emotion, selected = false, onPress }: { emotion: string; selected?: boolean; onPress?: () => void }) {
  const color = getEmotionColor(emotion);
  const content = <Text style={styles.chipText}>{selected ? "✓ " : ""}{emotion}</Text>;
  const chipStyle = [styles.chip, { backgroundColor: `${color}${selected ? "55" : "25"}`, borderColor: selected ? color : `${color}88` }];
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => [chipStyle, pressed && styles.pressed]}>{content}</Pressable> : <View style={chipStyle}>{content}</View>;
}

export function BottomTabs() {
  const { route, resetTo } = useApp();
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
  page: { flex: 1, backgroundColor: tokens.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 28 },
  card: {
    backgroundColor: tokens.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: tokens.outline,
    padding: 16,
    shadowColor: tokens.primaryDark,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2
  },
  logoOuter: { backgroundColor: tokens.primaryLight, alignItems: "center", justifyContent: "center" },
  logoMiddle: { backgroundColor: tokens.primaryContainer, alignItems: "center", justifyContent: "center" },
  logoCore: { backgroundColor: tokens.primary, alignItems: "center", justifyContent: "center" },
  logoLight: { backgroundColor: "rgba(255,255,255,0.86)" },
  topBar: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 },
  topSlot: { width: 44, alignItems: "flex-start" },
  topSlotRight: { alignItems: "flex-end" },
  topTitle: { fontFamily: "serif", fontSize: 16, fontWeight: "700", color: tokens.text },
  iconButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  backIcon: { color: tokens.primary, fontSize: 34, lineHeight: 36, fontWeight: "300" },
  menuIcon: { color: tokens.primary, fontSize: 16, letterSpacing: 1 },
  button: { minHeight: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, backgroundColor: tokens.primary },
  outlineButton: { backgroundColor: "transparent", borderWidth: 2, borderColor: tokens.primary },
  dangerButton: { backgroundColor: tokens.danger },
  disabledButton: { backgroundColor: tokens.outline },
  buttonText: { color: tokens.white, fontSize: 15, fontWeight: "700" },
  outlineButtonText: { color: tokens.primary },
  disabledText: { color: tokens.textMuted },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  chip: { borderRadius: 999, borderWidth: 1.5, paddingHorizontal: 13, paddingVertical: 7 },
  chipText: { color: tokens.text, fontSize: 13, fontWeight: "600" },
  tabs: { flexDirection: "row", backgroundColor: tokens.white, borderTopWidth: 1, borderTopColor: tokens.outline },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 62, gap: 2 },
  tabIcon: { fontSize: 23, lineHeight: 25, color: tokens.tabMuted },
  tabLabel: { fontSize: 10, fontWeight: "600", color: tokens.tabMuted },
  tabActive: { color: tokens.primary }
});

export const sharedStyles = styles;
