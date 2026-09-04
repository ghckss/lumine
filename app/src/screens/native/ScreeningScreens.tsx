import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { tokens } from "../../config/tokens";
import { useApp } from "../../context/AppContext";
import { api } from "../../lib/api";
import { Card, Logo, Page, PageScroll, PrimaryButton, TopBar, typography } from "../../components/NativeUI";
import { fallbackQuestionnaire, type ScreeningQuestionnaire, type ScreeningResult } from "../../types/content";

export function CheckStartScreen() {
  const { navigate } = useApp();
  return (
    <Page>
      <TopBar showMenu />
      <PageScroll>
        <View style={styles.hero}><Logo size={96} /><Text style={[typography.hero, styles.heroTitle]}>마음 상태 확인</Text><Text style={styles.heroBody}>지금 내 마음이 어떤지 부드럽게 살펴볼게요.{"\n"}솔직하게 답해주실수록 더 알맞은 결과를 드릴 수 있어요.</Text></View>
        <View style={styles.infoRow}>
          {[{ icon: "⏱️", title: "약 5분", body: "소요 시간" }, { icon: "🔒", title: "비공개", body: "개인정보 보호" }, { icon: "📊", title: "11가지", body: "질문 항목" }].map((item) => (
            <Card key={item.title} style={styles.infoCard}><Text style={styles.infoIcon}>{item.icon}</Text><Text style={styles.infoTitle}>{item.title}</Text><Text style={typography.caption}>{item.body}</Text></Card>
          ))}
        </View>
        <View style={styles.notice}><Text style={styles.noticeTitle}>안내사항</Text>{["지난 2주간을 기준으로 답변해주세요", "결과는 점수나 진단명 없이 친절하게 전달돼요", "다음 확인은 4주 후에 권장해요", "이 확인은 전문적인 진단을 대체하지 않아요"].map((line) => <Text key={line} style={styles.noticeLine}>•  {line}</Text>)}</View>
      </PageScroll>
      <View style={styles.bottom}><PrimaryButton label="시작하기" onPress={() => navigate("check-question", { index: 0, answers: {} })} /></View>
    </Page>
  );
}

export function CheckQuestionScreen() {
  const { route, goBack, navigate, saveScreening } = useApp();
  const [questionnaire, setQuestionnaire] = useState<ScreeningQuestionnaire>((route.params?.questionnaire as ScreeningQuestionnaire | undefined) ?? fallbackQuestionnaire);
  const [selected, setSelected] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const index = typeof route.params?.index === "number" ? route.params.index : 0;
  const previousAnswers = (route.params?.answers as Record<string, string> | undefined) ?? {};
  const questions = useMemo(() => questionnaire.sections.flatMap((section) => section.items), [questionnaire]);
  const question = questions[index] ?? fallbackQuestionnaire.sections[0].items[index];

  useEffect(() => {
    if (index === 0) api.getScreeningQuestionnaire().then(setQuestionnaire).catch(() => undefined);
  }, [index]);

  async function next() {
    const value = question.kind === "long_text" ? freeText : selected;
    if (question.required && !value) return;
    const answers = { ...previousAnswers, ...(value ? { [question.id]: value } : {}) };
    if (index < questions.length - 1) {
      navigate("check-question", { index: index + 1, answers, questionnaire });
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const local = buildLocalResult(questions, answers);
      const result = await saveScreening(answers, local);
      navigate(result.requiresSafetyPrompt ? "safety-result" : "check-result", { result });
    } catch {
      setError("결과를 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canNext = !question.required || question.kind === "long_text" || selected !== null;
  const isSafetyQuestion = question.id === "q9" || question.title.includes("해치려는");

  return (
    <Page>
      <TopBar showMenu onBack={goBack} />
      <View style={styles.progressWrap}><View style={styles.progressLabels}><Text style={typography.caption}>{index + 1} / {questions.length}</Text><Text style={styles.progressText}>{Math.round(((index + 1) / questions.length) * 100)}%</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((index + 1) / questions.length) * 100}%` }]} /></View></View>
      <PageScroll contentStyle={styles.questionContent}>
        {isSafetyQuestion ? <View style={styles.safetyNotice}><Text style={styles.safetyNoticeText}>힘든 생각이 드신다면 혼자 견디지 않아도 돼요. 아래 질문에 솔직하게 답해주세요.</Text></View> : null}
        <Text style={typography.title}>{question.title}</Text>
        {question.description ? <Text style={[typography.muted, styles.description]}>{question.description}</Text> : null}
        {question.kind === "long_text" ? (
          <TextInput value={freeText} onChangeText={setFreeText} multiline textAlignVertical="top" placeholder="자유롭게 적어주세요. 작성하지 않아도 괜찮아요." placeholderTextColor={tokens.textMuted} style={styles.freeInput} />
        ) : (
          <View style={styles.options}>{question.options.map((option, optionIndex) => {
            const active = selected === option.value;
            return <Pressable key={option.value} onPress={() => setSelected(option.value)} style={({ pressed }) => [styles.option, active && styles.optionActive, pressed && styles.pressed]}><View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View><View><Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{option.label}</Text><View style={styles.dots}>{Array.from({ length: 4 }, (_, dot) => <View key={dot} style={[styles.scaleDot, dot <= optionIndex && { backgroundColor: active ? tokens.primary : tokens.primaryContainer }]} />)}</View></View></Pressable>;
          })}</View>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </PageScroll>
      <View style={styles.bottom}><PrimaryButton label={isSubmitting ? "결과를 준비하는 중" : index === questions.length - 1 ? "제출하기" : "다음"} disabled={!canNext || isSubmitting} onPress={() => void next()} /></View>
    </Page>
  );
}

export function CheckResultScreen({ safety = false }: { safety?: boolean }) {
  const { route, navigate, resetTo } = useApp();
  const result = route.params?.result as ScreeningResult | undefined;
  if (!result) return <Page><TopBar title="마음 상태 결과" /><View style={styles.hero}><ActivityIndicator color={tokens.primary} /></View></Page>;

  return (
    <Page>
      <TopBar title={safety ? "마음이 걱정돼요" : "마음 상태 결과"} showBack={false} showMenu />
      <PageScroll>
        <View style={styles.resultHero}>
          {safety ? <View style={styles.warningMark}><Text style={styles.warningText}>!</Text></View> : <Logo size={80} />}
          <Text style={[typography.title, styles.resultTitle]}>{safety ? "지금 많이 힘드신 것 같아요" : result.publicSummary}</Text>
          {safety ? <Text style={styles.heroBody}>당신의 마음이 걱정돼요. 혼자 버티려 하지 않아도 돼요.{"\n"}도움을 요청하는 것은 용기 있는 일이에요.</Text> : null}
        </View>
        <Card style={styles.comfortCard}><Text style={styles.heart}>💜</Text><Text style={styles.comfortText}>{result.publicComfortMessage}</Text></Card>
        {safety ? <EmergencyCards /> : <><Text style={[typography.section, styles.recommendTitle]}>추천 행동</Text>{result.recommendedActions.map((action, index) => <Card key={action} style={styles.recommendCard}><View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View><Text style={styles.recommendText}>{action}</Text></Card>)}<View style={styles.rescreen}><Text style={styles.rescreenTitle}>◷  다음 확인 권장일</Text><Text style={typography.muted}>{new Date(result.recommendedRescreenAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</Text></View></>}
        {safety ? <Pressable onPress={() => navigate("check-result", { result })} style={styles.generalResult}><Text style={typography.muted}>일반 결과도 확인하기</Text><Text style={styles.helpArrow}>›</Text></Pressable> : null}
        <Pressable onPress={() => navigate("safety-help")} style={styles.helpLink}><Text style={styles.helpIcon}>🆘</Text><View style={{ flex: 1 }}><Text style={styles.helpTitle}>도움이 필요하다면</Text><Text style={styles.helpBody}>전문 상담 연결하기</Text></View><Text style={styles.helpArrow}>›</Text></Pressable>
      </PageScroll>
      <View style={styles.resultActions}><View style={{ flex: 1 }}><PrimaryButton variant="outline" label="감정 일기 쓰기" onPress={() => navigate("diary")} /></View><View style={{ flex: 1 }}><PrimaryButton label="홈으로" onPress={() => resetTo("home")} /></View></View>
    </Page>
  );
}

function EmergencyCards() {
  return <View style={styles.emergencyWrap}><Text style={[typography.section, styles.recommendTitle]}>지금 바로 연결할 수 있어요</Text>{[["자살예방상담전화", "109", "24시간 무료 · 비밀보장"], ["응급전화", "119", "즉각 대응 · 24시간"]].map(([title, phone, body]) => <Card key={phone} style={[styles.emergencyCard, phone === "109" && { borderWidth: 2, borderColor: tokens.danger }]}><View style={[styles.phoneIcon, { backgroundColor: phone === "109" ? tokens.danger : tokens.accent }]}><Text style={styles.phoneIconText}>☎</Text></View><View style={{ flex: 1 }}><Text style={styles.emergencyTitle}>{title}</Text><Text style={[styles.phone, { color: phone === "109" ? tokens.danger : tokens.accent }]}>{phone}</Text><Text style={typography.caption}>{body}</Text></View></Card>)}</View>;
}

function buildLocalResult(questions: ReturnType<typeof flattenFallback>, answers: Record<string, string>): ScreeningResult {
  const score = questions.reduce((sum, question) => sum + (question.options.find((option) => option.value === answers[question.id])?.score ?? 0), 0);
  const crisisQuestion = questions.find((question) => question.id === "q9" || question.title.includes("해치려는"));
  const crisis = crisisQuestion ? Number(answers[crisisQuestion.id] ?? 0) > 0 : false;
  const completedDate = new Date().toISOString().slice(0, 10);
  const next = new Date(); next.setDate(next.getDate() + 28);
  return {
    id: `screening:${Date.now()}`,
    completedDate,
    publicSummary: score <= 9 ? "마음이 전반적으로 안정적인 편이에요. 지금처럼 자신을 잘 돌봐주세요." : score <= 19 ? "최근 감정적으로 조금 지쳐있는 것 같아요. 나를 위한 시간이 필요해 보여요." : "마음이 많이 힘든 상태인 것 같아요. 당신을 위한 도움이 필요한 시기예요.",
    publicComfortMessage: crisis ? "당신의 마음이 많이 지쳐있는 것 같아요. 혼자 버티려 하지 않아도 돼요. 도움을 요청하는 것은 용기 있는 일이에요." : "오늘 자신의 마음을 들여다보는 시간을 가진 것이 정말 소중해요. 작은 불편함도 솔직하게 마주한 나를 다독여주세요.",
    recommendedActions: ["규칙적인 수면 시간을 지켜보세요", "가벼운 산책이나 스트레칭을 시도해보세요", "신뢰하는 사람과 솔직하게 이야기 나눠보세요"],
    recommendedRescreenAt: next.toISOString().slice(0, 10),
    requiresSafetyPrompt: crisis,
    comparisonScore: score
  };
}

function flattenFallback() { return fallbackQuestionnaire.sections.flatMap((section) => section.items); }

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingTop: 22, paddingBottom: 28 },
  heroTitle: { marginTop: 18, fontSize: 25 },
  heroBody: { ...typography.muted, textAlign: "center", marginTop: 10 },
  infoRow: { flexDirection: "row", gap: 8 },
  infoCard: { flex: 1, paddingHorizontal: 7, alignItems: "center" },
  infoIcon: { fontSize: 21 },
  infoTitle: { color: tokens.text, fontSize: 13, fontWeight: "700", marginTop: 6 },
  notice: { backgroundColor: tokens.primaryLight, borderRadius: 18, borderWidth: 1, borderColor: tokens.outline, padding: 16, marginTop: 24 },
  noticeTitle: { color: tokens.primaryDark, fontWeight: "700", marginBottom: 8 },
  noticeLine: { ...typography.muted, marginTop: 5 },
  bottom: { paddingHorizontal: 20, paddingBottom: 12 },
  progressWrap: { paddingHorizontal: 20, paddingBottom: 8 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 7 },
  progressText: { ...typography.caption, color: tokens.primary, fontWeight: "700" },
  progressTrack: { height: 6, backgroundColor: tokens.outline, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: tokens.primary, borderRadius: 3 },
  questionContent: { paddingTop: 18 },
  safetyNotice: { backgroundColor: tokens.dangerLight, borderRadius: 13, borderWidth: 1, borderColor: "#F2C5C0", padding: 13, marginBottom: 16 },
  safetyNoticeText: { ...typography.caption, color: tokens.danger },
  description: { marginTop: 6 },
  options: { gap: 11, marginTop: 26 },
  option: { minHeight: 74, flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 18, borderWidth: 2, borderColor: tokens.outline, backgroundColor: tokens.white, paddingHorizontal: 16 },
  optionActive: { borderColor: tokens.primary, backgroundColor: tokens.primaryLight },
  radio: { width: 21, height: 21, borderRadius: 11, borderWidth: 2, borderColor: tokens.outline, alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: tokens.primary, backgroundColor: tokens.primary },
  radioDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: tokens.white },
  optionLabel: { color: tokens.text, fontSize: 14, fontWeight: "600" },
  optionLabelActive: { color: tokens.primaryDark },
  dots: { flexDirection: "row", gap: 3, marginTop: 5 },
  scaleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: tokens.outline },
  freeInput: { minHeight: 170, borderRadius: 18, borderWidth: 1, borderColor: tokens.outline, backgroundColor: tokens.white, padding: 15, color: tokens.text, marginTop: 26, fontSize: 14, lineHeight: 22 },
  error: { color: tokens.danger, fontSize: 12, marginTop: 13 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  resultHero: { alignItems: "center", paddingVertical: 24 },
  resultTitle: { textAlign: "center", marginTop: 16 },
  warningMark: { width: 80, height: 80, borderRadius: 40, backgroundColor: tokens.dangerLight, alignItems: "center", justifyContent: "center" },
  warningText: { color: tokens.danger, fontSize: 42, fontWeight: "700" },
  comfortCard: { flexDirection: "row", alignItems: "flex-start", gap: 11, marginBottom: 22 },
  heart: { fontSize: 20 },
  comfortText: { ...typography.body, flex: 1 },
  recommendTitle: { marginBottom: 11 },
  recommendCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 9 },
  number: { width: 28, height: 28, borderRadius: 14, backgroundColor: tokens.primary, alignItems: "center", justifyContent: "center" },
  numberText: { color: tokens.white, fontWeight: "700", fontSize: 12 },
  recommendText: { ...typography.body, flex: 1 },
  rescreen: { backgroundColor: tokens.surfaceMuted, borderWidth: 1, borderColor: tokens.outline, borderRadius: 18, padding: 15, marginTop: 8 },
  rescreenTitle: { color: tokens.primaryDark, fontSize: 13, fontWeight: "700", marginBottom: 5 },
  helpLink: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: tokens.dangerLight, borderWidth: 1, borderColor: "#F2C5C0", borderRadius: 18, padding: 15, marginTop: 18 },
  helpIcon: { fontSize: 19 },
  helpTitle: { color: tokens.danger, fontWeight: "700", fontSize: 13 },
  helpBody: { color: tokens.danger, opacity: 0.8, fontSize: 11, marginTop: 2 },
  helpArrow: { color: tokens.danger, fontSize: 25 },
  resultActions: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingBottom: 12 },
  emergencyWrap: { marginBottom: 8 },
  emergencyCard: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10 },
  phoneIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  phoneIconText: { color: tokens.white, fontSize: 22 },
  emergencyTitle: { color: tokens.text, fontWeight: "700", fontSize: 13 },
  phone: { fontFamily: "serif", fontSize: 25, fontWeight: "700" },
  generalResult: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: tokens.surfaceMuted, borderWidth: 1, borderColor: tokens.outline, borderRadius: 16, paddingHorizontal: 15, minHeight: 52 }
});
