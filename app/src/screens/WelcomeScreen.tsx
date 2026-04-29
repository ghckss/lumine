import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { tokens } from "../config/tokens";

type WelcomeScreenProps = {
  onStart: () => void;
  onExistingAccount: () => void;
  onGuest: () => void;
};

const valueCards = [
  {
    title: "공감의 기록",
    body: "빨리 고쳐야 한다는 압박 대신, 오늘 하루 머물렀던 감정을 있는 그대로 담아내요."
  },
  {
    title: "잔잔한 파동",
    body: "마음 상태를 차갑게 수치화하지 않고, 은은한 결의 흐름으로 바라봐요."
  },
  {
    title: "안전한 도피처",
    body: "누구에게도 털어놓지 못한 이야기들을 조용히 내려놓을 수 있게 지켜드려요."
  }
] as const;

export function WelcomeScreen({ onStart, onExistingAccount, onGuest }: WelcomeScreenProps) {
  const glow = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: true
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 2600,
          useNativeDriver: true
        })
      ])
    );

    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(wave, {
          toValue: 1,
          duration: 3800,
          useNativeDriver: true
        }),
        Animated.timing(wave, {
          toValue: 0,
          duration: 3800,
          useNativeDriver: true
        })
      ])
    );

    glowLoop.start();
    waveLoop.start();

    return () => {
      glowLoop.stop();
      waveLoop.stop();
    };
  }, [glow, wave]);

  const glowStyle = useMemo(
    () => ({
      opacity: glow.interpolate({
        inputRange: [0, 1],
        outputRange: [0.55, 0.95]
      }),
      transform: [
        {
          scale: glow.interpolate({
            inputRange: [0, 1],
            outputRange: [0.96, 1.06]
          })
        }
      ]
    }),
    [glow]
  );

  const waveOneStyle = useMemo(
    () => ({
      opacity: wave.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.08] }),
      transform: [{ scale: wave.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.24] }) }]
    }),
    [wave]
  );

  const waveTwoStyle = useMemo(
    () => ({
      opacity: wave.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.04] }),
      transform: [{ scale: wave.interpolate({ inputRange: [0, 1], outputRange: [1.02, 1.38] }) }]
    }),
    [wave]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandEyebrow}>lumis eterne</Text>
        <Text style={styles.brandTitle}>Lumine</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.visualWrap}>
            <Animated.View style={[styles.waveRingPrimary, waveOneStyle]} />
            <Animated.View style={[styles.waveRingSecondary, waveTwoStyle]} />
            <Animated.View style={[styles.dropletGlow, glowStyle]} />
            <View style={styles.dropletCore} />
          </View>

          <Text style={styles.heroTitle}>당신의 밤이 조금 더 평온해지도록.</Text>
          <Text style={styles.heroBody}>
            Lumine은 당신을 평가하지 않아요. 그저 당신의 마음 결을 따라 조용히 곁을 지킬게요.
          </Text>
        </View>

        <View style={styles.messageBlock}>
          <Text style={styles.messageTitle}>애쓰지 않아도 괜찮아요.</Text>
          <Text style={styles.messageBody}>오늘의 당신을 기록하는 것부터 시작해요.</Text>
        </View>

        <View style={styles.valueList}>
          {valueCards.map((card) => (
            <View key={card.title} style={styles.valueCard}>
              <Text style={styles.valueTitle}>{card.title}</Text>
              <Text style={styles.valueBody}>{card.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomBlock}>
          <Pressable style={styles.primaryButton} onPress={onStart}>
            <Text style={styles.primaryButtonText}>조용히 시작해보기</Text>
          </Pressable>

          <Pressable style={styles.secondaryAccentButton} onPress={onGuest}>
            <Text style={styles.secondaryAccentButtonText}>가입 없이 먼저 마음 들여다보기</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onExistingAccount}>
            <Text style={styles.secondaryButtonText}>이미 계정이 있나요?</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.background },
  header: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 8 },
  brandEyebrow: { color: tokens.primary, fontSize: 12, fontWeight: "700", letterSpacing: 0.6, textTransform: "lowercase" },
  brandTitle: { marginTop: 8, color: tokens.text, fontSize: 26, fontWeight: "700" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  heroCard: { backgroundColor: tokens.surface, borderRadius: 32, borderWidth: 1, borderColor: tokens.outline, paddingHorizontal: 24, paddingVertical: 28, alignItems: "center" },
  visualWrap: { width: 220, height: 220, alignItems: "center", justifyContent: "center" },
  waveRingPrimary: { position: "absolute", width: 168, height: 168, borderRadius: 999, borderWidth: 1, borderColor: tokens.primaryContainer, backgroundColor: "rgba(177, 156, 217, 0.08)" },
  waveRingSecondary: { position: "absolute", width: 208, height: 208, borderRadius: 999, borderWidth: 1, borderColor: "rgba(103, 85, 140, 0.18)" },
  dropletGlow: { position: "absolute", width: 112, height: 112, borderRadius: 32, backgroundColor: tokens.primaryContainer },
  dropletCore: { width: 82, height: 104, borderRadius: 28, backgroundColor: tokens.primary, transform: [{ rotate: "18deg" }], shadowColor: tokens.primary, shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  heroTitle: { marginTop: 6, color: tokens.text, fontSize: 28, lineHeight: 36, fontWeight: "700", textAlign: "center" },
  heroBody: { marginTop: 14, color: tokens.textMuted, fontSize: 15, lineHeight: 24, textAlign: "center" },
  messageBlock: { marginTop: 18, paddingHorizontal: 8, paddingVertical: 10, alignItems: "center" },
  messageTitle: { color: tokens.text, fontSize: 20, lineHeight: 28, fontWeight: "700", textAlign: "center" },
  messageBody: { marginTop: 6, color: tokens.textMuted, fontSize: 15, lineHeight: 22, textAlign: "center" },
  valueList: { marginTop: 8, gap: 12 },
  valueCard: { backgroundColor: tokens.surfaceMuted, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 18, borderWidth: 1, borderColor: "rgba(177, 156, 217, 0.32)" },
  valueTitle: { color: tokens.primary, fontSize: 16, fontWeight: "700" },
  valueBody: { marginTop: 8, color: tokens.textMuted, fontSize: 14, lineHeight: 22 },
  bottomBlock: { marginTop: 22, alignItems: "center" },
  primaryButton: { width: "100%", minHeight: 56, borderRadius: 999, backgroundColor: tokens.primaryContainer, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: tokens.primary, fontSize: 15, fontWeight: "800" },
  secondaryAccentButton: { width: "100%", minHeight: 52, marginTop: 12, borderRadius: 999, borderWidth: 1, borderColor: tokens.primaryContainer, backgroundColor: tokens.surface, alignItems: "center", justifyContent: "center" },
  secondaryAccentButtonText: { color: tokens.primary, fontSize: 14, fontWeight: "700" },
  secondaryButton: { marginTop: 14, paddingHorizontal: 12, paddingVertical: 8 },
  secondaryButtonText: { color: tokens.textMuted, fontSize: 14, fontWeight: "600" }
});
