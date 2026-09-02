import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { tokens } from "../config/tokens";
import { useSession } from "../context/SessionContext";
import type { Gender } from "../types/session";

const genders: Array<{ value: Gender; label: string }> = [{ value: "FEMALE", label: "여성" }, { value: "MALE", label: "남성" }, { value: "OTHER", label: "기타" }];

export function ProfileSetupScreen() {
  const { session, completeProfile } = useSession();
  const [gender, setGender] = useState<Gender | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [age, setAge] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const allAgreed = terms && privacy && age;
  const valid = useMemo(() => Boolean(gender && /^\d{4}-\d{2}-\d{2}$/.test(birthDate) && allAgreed), [allAgreed, birthDate, gender]);

  async function submit() {
    if (!valid || !gender) return;
    setSubmitting(true); setError(null);
    try { await completeProfile({ gender, birthDate, agreedToTerms: true }); } catch { setError("정보를 저장하지 못했어요. 다시 시도해주세요."); } finally { setSubmitting(false); }
  }

  function toggleAll() { const next = !allAgreed; setTerms(next); setPrivacy(next); setAge(next); }
  return <View style={styles.page}><View style={styles.top}><Text style={styles.topTitle}>프로필 설정</Text></View><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.greeting}>{session?.displayName ?? "사용자"}님, 반가워요.</Text><Text style={styles.intro}>더 나은 서비스를 위해 간단한 정보를 입력해주세요.{"\n"}질문은 필요한 만큼만 보여드릴게요.</Text>
    <Text style={styles.label}>성별</Text><View style={styles.genderGrid}>{genders.map((item) => <Pressable key={item.value} onPress={() => setGender(item.value)} style={[styles.genderButton, gender === item.value && styles.genderActive]}><Text style={[styles.genderText, gender === item.value && styles.genderTextActive]}>{item.label}</Text></Pressable>)}</View>
    <Text style={styles.label}>생년월일</Text><TextInput value={birthDate} onChangeText={setBirthDate} placeholder="YYYY-MM-DD" placeholderTextColor={tokens.textMuted} keyboardType="numbers-and-punctuation" style={styles.input} />
    <View style={styles.agreementCard}><Agreement checked={allAgreed} label="전체 동의" bold onPress={toggleAll} divider /><Agreement checked={terms} label="[필수] 이용약관 동의" onPress={() => setTerms(!terms)} /><Agreement checked={privacy} label="[필수] 개인정보처리방침 동의" onPress={() => setPrivacy(!privacy)} /><Agreement checked={age} label="[필수] 만 14세 이상 확인" onPress={() => setAge(!age)} /></View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </ScrollView><View style={styles.bottom}><Pressable disabled={!valid || submitting} onPress={() => void submit()} style={[styles.submit, (!valid || submitting) && styles.submitDisabled]}>{submitting ? <ActivityIndicator color={tokens.white} /> : <Text style={styles.submitText}>시작하기</Text>}</Pressable></View></View>;
}

function Agreement({ checked, label, onPress, bold = false, divider = false }: { checked: boolean; label: string; onPress: () => void; bold?: boolean; divider?: boolean }) {
  return <Pressable onPress={onPress} style={[styles.agreement, divider && styles.divider]}><View style={[styles.check, checked && styles.checkActive]}><Text style={styles.checkText}>{checked ? "✓" : ""}</Text></View><Text style={[styles.agreementText, bold && styles.agreementBold]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.background }, top: { height: 54, alignItems: "center", justifyContent: "center" }, topTitle: { fontFamily: "serif", color: tokens.text, fontSize: 16, fontWeight: "700" }, content: { paddingHorizontal: 20, paddingBottom: 24 }, greeting: { fontFamily: "serif", color: tokens.text, fontSize: 24, lineHeight: 32, fontWeight: "700", marginTop: 10 }, intro: { color: tokens.textMuted, fontSize: 14, lineHeight: 22, marginTop: 8 }, label: { color: tokens.text, fontSize: 14, fontWeight: "700", marginTop: 25, marginBottom: 10 }, genderGrid: { flexDirection: "row", gap: 8 }, genderButton: { flex: 1, height: 50, borderRadius: 14, borderWidth: 1, borderColor: tokens.outline, backgroundColor: tokens.white, alignItems: "center", justifyContent: "center" }, genderActive: { backgroundColor: tokens.primary, borderColor: tokens.primary }, genderText: { color: tokens.textMuted, fontSize: 14, fontWeight: "600" }, genderTextActive: { color: tokens.white }, input: { height: 52, borderRadius: 14, borderWidth: 1, borderColor: tokens.outline, backgroundColor: tokens.white, paddingHorizontal: 15, color: tokens.text }, agreementCard: { borderRadius: 18, borderWidth: 1, borderColor: tokens.outline, backgroundColor: tokens.white, padding: 14, marginTop: 24 }, agreement: { flexDirection: "row", alignItems: "center", gap: 11, minHeight: 42 }, divider: { borderBottomWidth: 1, borderBottomColor: tokens.outline, marginBottom: 4, paddingBottom: 4 }, check: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: tokens.outline, alignItems: "center", justifyContent: "center" }, checkActive: { backgroundColor: tokens.primary, borderColor: tokens.primary }, checkText: { color: tokens.white, fontSize: 12, fontWeight: "700" }, agreementText: { flex: 1, color: tokens.textMuted, fontSize: 13 }, agreementBold: { color: tokens.text, fontWeight: "700" }, error: { color: tokens.danger, fontSize: 12, marginTop: 12 }, bottom: { paddingHorizontal: 20, paddingBottom: 12 }, submit: { height: 54, borderRadius: 17, backgroundColor: tokens.primary, alignItems: "center", justifyContent: "center" }, submitDisabled: { backgroundColor: tokens.outline }, submitText: { color: tokens.white, fontSize: 15, fontWeight: "700" }
});
