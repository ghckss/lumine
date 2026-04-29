import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSession } from "../context/SessionContext";
import { tokens } from "../config/tokens";

type NativeAuthScreenProps = {
  onBack?: () => void;
};

export function NativeAuthScreen({ onBack }: NativeAuthScreenProps) {
  const { login } = useSession();
  const [pendingProvider, setPendingProvider] = useState<"kakao" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(provider: "kakao" | "google") {
    setPendingProvider(provider);
    setError(null);

    try {
      await login(provider);
    } catch {
      setError("로그인을 다시 시도해주세요.");
    } finally {
      setPendingProvider(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>이전으로</Text>
          </Pressable>
        ) : null}

        <Text style={styles.eyebrow}>lumis eterne</Text>
        <Text style={styles.title}>조용히 시작해볼까요?</Text>
        <Text style={styles.body}>로그인과 가입은 앱 안에서 가볍게 이어갈게요.</Text>

        <Pressable
          onPress={() => void handleLogin("kakao")}
          style={[styles.socialButton, styles.kakaoButton]}
          disabled={pendingProvider !== null}
        >
          {pendingProvider === "kakao" ? (
            <ActivityIndicator color="#1f1a12" />
          ) : (
            <Text style={styles.kakaoText}>카카오로 시작</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => void handleLogin("google")}
          style={[styles.socialButton, styles.googleButton]}
          disabled={pendingProvider !== null}
        >
          {pendingProvider === "google" ? (
            <ActivityIndicator color={tokens.primary} />
          ) : (
            <Text style={styles.googleText}>Google로 시작</Text>
          )}
        </Pressable>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 18,
    paddingVertical: 4
  },
  backButtonText: {
    color: tokens.textMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.primary
  },
  title: {
    marginTop: 14,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700",
    color: tokens.text
  },
  body: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: tokens.textMuted
  },
  socialButton: {
    marginTop: 16,
    minHeight: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  kakaoButton: {
    backgroundColor: "#FEE500"
  },
  kakaoText: {
    color: "#1f1a12",
    fontSize: 15,
    fontWeight: "700"
  },
  googleButton: {
    backgroundColor: tokens.white,
    borderWidth: 1,
    borderColor: tokens.outline
  },
  googleText: {
    color: tokens.text,
    fontSize: 15,
    fontWeight: "700"
  },
  errorText: {
    marginTop: 14,
    color: "#B3261E",
    fontSize: 13
  }
});
