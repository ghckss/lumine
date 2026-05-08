import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "../config/tokens";

export type TabKey = "home" | "history";

type BottomTabBarProps = {
  activeTab: TabKey;
  onPress: (tab: TabKey) => void;
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "home", label: "홈" },
  { key: "history", label: "내 마음기록" }
];

export function BottomTabBar({ activeTab, onPress }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onPress(tab.key)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: `${tokens.background}F2`,
    borderTopWidth: 1,
    borderTopColor: tokens.outline,
    shadowColor: tokens.primary,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: tokens.surfaceMuted
  },
  tabActive: {
    backgroundColor: tokens.primaryContainer
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.textMuted
  },
  labelActive: {
    color: tokens.primary
  }
});
