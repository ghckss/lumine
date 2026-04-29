import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "../config/tokens";

type PermissionGateProps = {
  onContinue: () => void;
};

export function PermissionGate({ onContinue }: PermissionGateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>시작하기 전에</Text>
        <Text style={styles.title}>알림과 도움 연결은 앱에서 맡을게요.</Text>
        <Text style={styles.body}>
          기록 알림, 긴급 도움 연결, 안전한 저장은 네이티브에서 처리해요. 지금은 웹 화면을 먼저
          열어둘게요.
        </Text>

        <Pressable onPress={onContinue} style={styles.button}>
          <Text style={styles.buttonText}>계속하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: tokens.background,
    paddingHorizontal: 20
  },
  card: {
    backgroundColor: tokens.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: tokens.outline
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.primary
  },
  title: {
    marginTop: 12,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "700",
    color: tokens.text
  },
  body: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 23,
    color: tokens.textMuted
  },
  button: {
    marginTop: 24,
    minHeight: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.primary
  },
  buttonText: {
    color: tokens.white,
    fontSize: 15,
    fontWeight: "700"
  }
});
