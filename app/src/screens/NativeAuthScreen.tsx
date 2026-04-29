import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSession } from "../context/SessionContext";
import { tokens } from "../config/tokens";

export function NativeAuthScreen() {
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
        <Text style={styles.eyebrow}>lumis eterne</Text>
        <Text style={styles.title}>당신의 영원한 빛으로 들어와요.</Text>
        <Text style={styles.body}>로그인과 가입은 앱에서 먼저 조용히 마칠게요.</Text>

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
