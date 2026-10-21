import React, { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { tokens } from "../../../shared/theme/tokens";
import { Page, PageScroll, PrimaryButton, typography } from "../../../shared/ui";
import { screeningApi } from "../api/screening-api";
import { useScreening } from "../model/ScreeningProvider";
import { fallbackQuestionnaire, type ScreeningQuestionnaire, type ScreeningResult } from "../model/screening";
import { buildLocalScreeningResult } from "../model/screening-results";
import { screeningScreenStyles as styles } from "./screening-screen-styles";

export type ScreeningQuestionProgress = {
  index: number;
  answers: Record<string, string>;
  questionnaire: ScreeningQuestionnaire;
};

type Props = {
  index: number;
  previousAnswers: Record<string, string>;
  initialQuestionnaire?: ScreeningQuestionnaire;
  header?: React.ReactNode;
  onNext: (progress: ScreeningQuestionProgress) => void;
  onComplete: (result: ScreeningResult) => void;
};

export function CheckQuestionScreen({ index, previousAnswers, initialQuestionnaire, header, onNext, onComplete }: Props) {
  const { saveScreening } = useScreening();
  const [questionnaire, setQuestionnaire] = useState<ScreeningQuestionnaire>(initialQuestionnaire ?? fallbackQuestionnaire);
  const [selected, setSelected] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const questions = useMemo(() => questionnaire.sections.flatMap((section) => section.items), [questionnaire]);
  const question = questions[index] ?? fallbackQuestionnaire.sections[0].items[index];

  useEffect(() => {
    if (index === 0) screeningApi.getScreeningQuestionnaire().then(setQuestionnaire).catch(() => undefined);
  }, [index]);

  async function next() {
    const value = question.kind === "long_text" ? freeText : selected;
    if (question.required && !value) return;
    const answers = { ...previousAnswers, ...(value ? { [question.id]: value } : {}) };
    if (index < questions.length - 1) {
      onNext({ index: index + 1, answers, questionnaire });
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await saveScreening(answers, buildLocalScreeningResult(questions, answers));
      onComplete(result);
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
      {header}
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
