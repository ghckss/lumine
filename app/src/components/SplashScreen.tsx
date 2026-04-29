import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { tokens } from "../config/tokens";

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>lumis eterne</Text>
      </View>
      <Text style={styles.title}>lumine</Text>
      <Text style={styles.subtitle}>당신의 영원한 빛</Text>
      <ActivityIndicator color={tokens.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.background,
    paddingHorizontal: 24
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: tokens.secondaryContainer
  },
  badgeText: {
    color: tokens.secondary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4
  },
  title: {
    marginTop: 24,
    fontSize: 32,
    fontWeight: "700",
    color: tokens.text
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: tokens.textMuted
  },
  loader: {
    marginTop: 28
  }
});
