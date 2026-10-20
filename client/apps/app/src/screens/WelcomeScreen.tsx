import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { tokens } from "../config/tokens";

type WelcomeScreenProps = { onLogin: (provider: "kakao" | "google") => Promise<void>; onGuest: () => void };
const features = [
  { icon: "💜", title: "마음 상태 확인", body: "정기적으로 내 마음의 상태를 확인하고 변화를 추적해요" },
  { icon: "📖", title: "감정 일기", body: "오늘의 감정을 기록하고 따뜻한 위로를 받아요" },
  { icon: "🌿", title: "기록 되돌아보기", body: "지난 감정의 흐름을 살펴보며 나를 더 깊이 이해해요" },
  { icon: "🛡️", title: "안전 도움", body: "힘들 때 언제든 연결할 수 있는 도움의 손길이 있어요" }
];

function WelcomeLogo() {
  return <View style={styles.logoOuter}><View style={styles.logoMiddle}><View style={styles.logoCore}><View style={styles.logoLight} /></View></View></View>;
}

export function WelcomeScreen({ onLogin, onGuest }: WelcomeScreenProps) {
  const [pending, setPending] = useState<"kakao" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function login(provider: "kakao" | "google") { setPending(provider); setError(null); try { await onLogin(provider); } catch { setError("로그인을 다시 시도해주세요."); } finally { setPending(null); } }
  return <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.hero}><WelcomeLogo /><Text style={styles.brand}>Lumine</Text><Text style={styles.tagline}>마음의 빛을 함께 찾아요</Text></View>
    <View style={styles.featureGrid}>{features.map((feature) => <View key={feature.title} style={styles.featureCard}><Text style={styles.featureIcon}>{feature.icon}</Text><Text style={styles.featureTitle}>{feature.title}</Text><Text style={styles.featureBody}>{feature.body}</Text></View>)}</View>
    <Text style={styles.startLabel}>시작하기</Text>
    <Pressable disabled={Boolean(pending)} onPress={() => void login("kakao")} style={({ pressed }) => [styles.socialButton, styles.kakao, pressed && styles.pressed]}>{pending === "kakao" ? <ActivityIndicator color="#3C1E1E" /> : <><Text style={styles.kakaoIcon}>●</Text><Text style={styles.kakaoText}>카카오로 시작하기</Text></>}</Pressable>
    <Pressable disabled={Boolean(pending)} onPress={() => void login("google")} style={({ pressed }) => [styles.socialButton, styles.google, pressed && styles.pressed]}>{pending === "google" ? <ActivityIndicator color={tokens.primary} /> : <><Text style={styles.googleIcon}>G</Text><Text style={styles.googleText}>Google로 시작하기</Text></>}</Pressable>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <Pressable onPress={onGuest} style={styles.guest}><Text style={styles.guestText}>로그인 없이 게스트로 이용하기</Text></Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.background }, content: { paddingHorizontal: 20, paddingBottom: 30 }, hero: { alignItems: "center", paddingTop: 42, paddingBottom: 26 },
  logoOuter: { width: 66, height: 66, borderRadius: 33, backgroundColor: tokens.primaryLight, alignItems: "center", justifyContent: "center" }, logoMiddle: { width: 46, height: 46, borderRadius: 23, backgroundColor: tokens.primaryContainer, alignItems: "center", justifyContent: "center" }, logoCore: { width: 28, height: 28, borderRadius: 14, backgroundColor: tokens.primary, alignItems: "center", justifyContent: "center" }, logoLight: { width: 9, height: 9, borderRadius: 5, backgroundColor: tokens.white },
  brand: { fontFamily: "serif", fontSize: 30, fontWeight: "700", color: tokens.primaryDark, marginTop: 13 }, tagline: { color: tokens.textMuted, fontSize: 13, marginTop: 3 },
  featureGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 11 }, featureCard: { width: "48.4%", minHeight: 145, borderRadius: 18, borderWidth: 1, borderColor: tokens.outline, backgroundColor: tokens.white, padding: 15 }, featureIcon: { fontSize: 24 }, featureTitle: { color: tokens.text, fontSize: 13, fontWeight: "700", marginTop: 9 }, featureBody: { color: tokens.textMuted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  startLabel: { color: tokens.textMuted, fontSize: 13, textAlign: "center", marginTop: 23, marginBottom: 9 }, socialButton: { minHeight: 54, borderRadius: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 10 }, kakao: { backgroundColor: "#FEE500" }, kakaoIcon: { color: "#3C1E1E", fontSize: 16 }, kakaoText: { color: "#3C1E1E", fontSize: 14, fontWeight: "700" }, google: { backgroundColor: tokens.white, borderWidth: 1, borderColor: tokens.outline }, googleIcon: { color: "#4285F4", fontSize: 18, fontWeight: "800" }, googleText: { color: tokens.text, fontSize: 14, fontWeight: "700" }, guest: { paddingVertical: 18, alignItems: "center" }, guestText: { color: tokens.textMuted, fontSize: 13, textDecorationLine: "underline" }, error: { color: tokens.danger, fontSize: 12, textAlign: "center", marginTop: 10 }, pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] }
});
