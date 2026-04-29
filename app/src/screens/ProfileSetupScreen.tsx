import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { tokens } from "../config/tokens";
import { useSession } from "../context/SessionContext";
import type { Gender } from "../types/session";

const genders: Array<{ value: Gender; label: string }> = [
  { value: "FEMALE", label: "여성" },
  { value: "MALE", label: "남성" },
  { value: "OTHER", label: "그 외" }
];

export function ProfileSetupScreen() {
  const { session, completeProfile } = useSession();
  const [gender, setGender] = useState<Gender>("FEMALE");
  const [birthDate, setBirthDate] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(() => /^\d{4}-\d{2}-\d{2}$/.test(birthDate) && agreedToTerms, [agreedToTerms, birthDate]);

  async function handleSubmit() {
    if (!isValid) {
      setError("생년월일과 약관 동의를 확인해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await completeProfile({ gender, birthDate, agreedToTerms });
    } catch {
      setError("정보를 저장하지 못했어요. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>{session?.displayName ?? "사용자"}님, 조금만 더 적어둘게요.</Text>
        <Text style={styles.title}>질문은 필요한 만큼만 보여드릴게요.</Text>

        <Text style={styles.label}>성별</Text>
        <View style={styles.segment}>
          {genders.map((item) => {
            const active = item.value === gender;
            return (
              <Pressable
                key={item.value}
                onPress={() => setGender(item.value)}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>생년월일</Text>
        <TextInput
          value={birthDate}
          onChangeText={setBirthDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={tokens.textMuted}
          style={styles.input}
          autoCapitalize="none"
        />

        <Pressable onPress={() => setAgreedToTerms((prev) => !prev)} style={styles.checkboxRow}>
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]} />
          <Text style={styles.checkboxText}>서비스 이용과 기록 저장에 동의해요.</Text>
        </Pressable>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          onPress={() => void handleSubmit()}
          disabled={isSubmitting}
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? "저장하는 중" : "계속하기"}</Text>
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
  label: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: tokens.text
  },
  segment: {
    flexDirection: "row",
    gap: 8
  },
  segmentButton: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: tokens.surfaceMuted
  },
  segmentButtonActive: {
    backgroundColor: tokens.primaryContainer
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: tokens.textMuted
  },
  segmentTextActive: {
    color: tokens.primary
  },
  input: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: tokens.outline,
    paddingHorizontal: 16,
    color: tokens.text,
    backgroundColor: tokens.white
  },
  checkboxRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.outline,
    backgroundColor: tokens.white
  },
  checkboxActive: {
    backgroundColor: tokens.primary,
    borderColor: tokens.primary
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: tokens.textMuted
  },
  errorText: {
    marginTop: 14,
    color: "#B3261E",
    fontSize: 13
  },
  submitButton: {
    marginTop: 24,
    minHeight: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.primary
  },
  submitButtonDisabled: {
    opacity: 0.7
  },
  submitButtonText: {
    color: tokens.white,
    fontSize: 15,
    fontWeight: "700"
  }
});
