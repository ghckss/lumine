import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "../config/tokens";

async function openTel(phone: string) {
  await Linking.openURL(`tel:${phone}`);
}

type SupportFallbackProps = {
  onRetry: () => void;
};

export function SupportFallback({ onRetry }: SupportFallbackProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>화면을 불러오지 못했어요</Text>
        <Text style={styles.title}>필요하면 바로 기댈 수 있는 곳부터 열어둘게요.</Text>
        <Text style={styles.body}>
          웹 화면이 잠시 열리지 않아도 도움 연결은 앱에서 바로 이어갈 수 있어요.
        </Text>

        <View style={styles.actionGroup}>
          <Pressable onPress={() => void openTel("109")} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>109로 연결하기</Text>
          </Pressable>
          <Pressable onPress={() => void openTel("119")} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>119 도움 요청하기</Text>
          </Pressable>
          <Pressable onPress={onRetry} style={styles.tertiaryButton}>
            <Text style={styles.tertiaryButtonText}>다시 시도하기</Text>
          </Pressable>
        </View>
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
    color: tokens.secondary
  },
  title: {
    marginTop: 12,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
    color: tokens.text
  },
  body: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 23,
    color: tokens.textMuted
  },
  actionGroup: {
    marginTop: 24,
    gap: 12
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.primary
  },
  primaryButtonText: {
    color: tokens.white,
    fontSize: 15,
    fontWeight: "700"
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.secondaryContainer
  },
  secondaryButtonText: {
    color: tokens.secondary,
    fontSize: 15,
    fontWeight: "700"
  },
  tertiaryButton: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.outline
  },
  tertiaryButtonText: {
    color: tokens.text,
    fontSize: 15,
    fontWeight: "600"
  }
});
