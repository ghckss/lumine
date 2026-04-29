import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "../config/tokens";

type NativeTopBarProps = {
  displayName: string;
  onLogout: () => void;
};

export function NativeTopBar({ displayName, onLogout }: NativeTopBarProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.eyebrow}>lumis eterne</Text>
        <Text style={styles.title}>{displayName}님, 오늘의 마음</Text>
      </View>

      <Pressable onPress={onLogout} style={styles.button}>
        <Text style={styles.buttonText}>로그아웃</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: tokens.outline,
    backgroundColor: `${tokens.surface}F5`
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: tokens.primary
  },
  title: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: tokens.text
  },
  button: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.secondaryContainer
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.secondary
  }
});
