import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { tokens } from "../../../shared/theme/tokens";
import { Page, PageScroll, PrimaryButton, typography } from "../../../shared/ui";
import { useJournal } from "../model/JournalProvider";
import { emotions } from "../model/journal";
import { loadJournalDraft, removeJournalDraft, saveJournalDraft } from "../storage/journal-drafts";
import { EmotionChip } from "./EmotionChip";
import { localIsoDay, styles } from "./journal-screen-ui";

export function DiaryScreen({ renderHeader, onOpenRecord }: {
  renderHeader: (hasExistingRecord: boolean) => React.ReactNode;
  onOpenRecord: (recordId: string) => void;
}) {
  const { journalOwner, journalRecords, saveJournal } = useJournal();
  const today = localIsoDay();
  const existing = journalRecords.find((record) => record.date === today);
  const [selected, setSelected] = useState(existing?.emotions ?? []);
  const [body, setBody] = useState(existing?.body ?? "");
  const [custom, setCustom] = useState("");
  const [customEmotions, setCustomEmotions] = useState<string[]>(existing?.emotions.filter((emotion) => !emotions.includes(emotion)) ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    let active = true;
    setDraftReady(false);
    loadJournalDraft(journalOwner, today)
      .catch(() => null)
      .then((draft) => {
        if (!active) return;
        setSelected(draft?.emotions ?? existing?.emotions ?? []);
        setBody(draft?.body ?? existing?.body ?? "");
        setCustom(draft?.customInput ?? "");
        setCustomEmotions(draft?.customEmotions ?? existing?.emotions.filter((emotion) => !emotions.includes(emotion)) ?? []);
        setDraftReady(true);
      });
    return () => { active = false; };
  }, [journalOwner, today]);

  useEffect(() => {
    if (!draftReady) return;
    const timer = setTimeout(() => {
      const unchanged = body === (existing?.body ?? "")
        && custom === ""
        && selected.join("\u0000") === (existing?.emotions ?? []).join("\u0000");
      if (unchanged) {
        void removeJournalDraft(journalOwner, today).catch(() => undefined);
        return;
      }
      void saveJournalDraft(journalOwner, {
        date: today,
        emotions: selected,
        customEmotions,
        customInput: custom,
        body,
        updatedAt: new Date().toISOString()
      }).catch(() => undefined);
    }, 700);
    return () => clearTimeout(timer);
  }, [body, custom, customEmotions, draftReady, existing?.body, existing?.emotions, journalOwner, selected, today]);

  function toggle(emotion: string) {
    setSelected((current) => current.includes(emotion) ? current.filter((item) => item !== emotion) : current.length < 3 ? [...current, emotion] : current);
  }

  function addCustom() {
    const value = custom.trim();
    if (!value || emotions.includes(value) || customEmotions.includes(value)) return;
    setCustomEmotions((current) => [...current, value]);
    setSelected((current) => current.length < 3 ? [...current, value] : current);
    setCustom("");
  }

  async function submit() {
    if (selected.length === 0) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const record = await saveJournal({ date: today, emotions: selected, body });
      setSavedMessage(record.comfortMessage);
      setTimeout(() => {
        setSavedMessage(null);
        onOpenRecord(record.id);
      }, 1800);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Page>
      {renderHeader(Boolean(existing))}
      <PageScroll>
        <Text style={typography.caption}>{new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</Text>
        <Text style={[typography.title, styles.diaryTitle]}>{existing ? "오늘의 감정을 수정할까요?" : "오늘 어떤 감정을 느꼈나요?"}</Text>
        <Text style={typography.caption}>최소 1개, 최대 3개를 선택해요</Text>
        <View style={styles.chipGrid}>{[...emotions, ...customEmotions].map((emotion) => <EmotionChip key={emotion} emotion={emotion} selected={selected.includes(emotion)} onPress={() => toggle(emotion)} />)}</View>
        <View style={styles.customRow}>
          <TextInput value={custom} onChangeText={setCustom} placeholder="직접 감정 입력" placeholderTextColor={tokens.textMuted} maxLength={8} style={styles.customInput} onSubmitEditing={addCustom} />
          <Pressable onPress={addCustom} style={styles.addButton}><Text style={styles.addText}>추가</Text></Pressable>
        </View>
        <Text style={styles.fieldLabel}>오늘 있었던 일</Text>
        <TextInput value={body} onChangeText={setBody} placeholder="오늘 어떤 하루였나요? 자유롭게 적어보세요." placeholderTextColor={tokens.textMuted} multiline textAlignVertical="top" style={styles.diaryInput} />
        <Text style={styles.counter}>{body.length}자</Text>
        {existing ? <View style={styles.notice}><Text style={styles.noticeText}>오늘의 기록이 이미 있어요. 저장하면 기존 기록이 갱신돼요.</Text></View> : null}
        {saveError ? <View style={styles.errorNotice} accessibilityLiveRegion="polite"><Text style={styles.errorText}>{saveError}</Text><Pressable accessibilityRole="button" onPress={() => void submit()}><Text style={styles.retryText}>다시 시도</Text></Pressable></View> : null}
      </PageScroll>
      <View style={styles.bottomAction}><PrimaryButton label={isSaving ? "저장하는 중" : existing ? "수정 완료" : "저장하기"} disabled={selected.length === 0 || isSaving} onPress={() => void submit()} /></View>
      <Modal visible={Boolean(savedMessage)} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.overlayMark}><Text style={styles.overlayCheck}>✓</Text></View>
          <Text style={styles.overlayTitle}>기록이 저장됐어요</Text>
          <View style={styles.overlayChips}>{selected.map((emotion) => <View key={emotion} style={styles.overlayChip}><Text style={styles.overlayChipText}>{emotion}</Text></View>)}</View>
          <Text style={styles.overlayMessage}>{savedMessage}</Text>
        </View>
      </Modal>
    </Page>
  );
}
