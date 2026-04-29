import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "../config/tokens";

type NativeTopBarProps = {
  displayName: string;
  onMenuPress: () => void;
};

export function NativeTopBar({ displayName, onMenuPress }: NativeTopBarProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.eyebrow}>lumis eterne</Text>
        <Text style={styles.title}>{displayName}</Text>
      </View>

      <Pressable onPress={onMenuPress} style={styles.menuButton}>
        <Text style={styles.menuIcon}>☰</Text>
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
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.secondaryContainer
  },
  menuIcon: {
    color: tokens.secondary,
    fontSize: 18,
    fontWeight: "700"
  }
});
