import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { tokens } from "../../config/tokens";
import { useApp } from "../../context/AppContext";
import { Card, EmotionChip, Logo, Page, PageScroll, PrimaryButton, TopBar, typography } from "../../components/NativeUI";
import { emotions } from "../../types/content";
import { loadJournalDraft, removeJournalDraft, saveJournalDraft } from "../../storage/journal-drafts";

function localIsoDay() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DiaryScreen() {
  const { journalOwner, journalRecords, saveJournal, navigate } = useApp();
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
        navigate("record-detail", { recordId: record.id, backToHome: true });
      }, 1800);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Page>
      <TopBar title={existing ? "감정 일기 수정" : "감정 일기"} showMenu />
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
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="오늘 어떤 하루였나요? 자유롭게 적어보세요."
          placeholderTextColor={tokens.textMuted}
          multiline
          textAlignVertical="top"
          style={styles.diaryInput}
        />
        <Text style={styles.counter}>{body.length}자</Text>
        {existing ? <View style={styles.notice}><Text style={styles.noticeText}>오늘의 기록이 이미 있어요. 저장하면 기존 기록이 갱신돼요.</Text></View> : null}
        {saveError ? (
          <View style={styles.errorNotice} accessibilityLiveRegion="polite">
            <Text style={styles.errorText}>{saveError}</Text>
            <Pressable accessibilityRole="button" onPress={() => void submit()}><Text style={styles.retryText}>다시 시도</Text></Pressable>
          </View>
        ) : null}
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

export function RecordDetailScreen() {
  const { route, journalRecords, navigate, resetTo, retryJournal, deleteJournal } = useApp();
  const [actionError, setActionError] = useState<string | null>(null);
  const record = journalRecords.find((item) => item.id === route.params?.recordId);
  if (!record) return <Page><TopBar title="기록 상세" /><View style={styles.empty}><Text style={styles.emptyEmoji}>📭</Text><Text style={typography.muted}>기록을 찾을 수 없어요</Text></View></Page>;

  return (
    <Page>
      <TopBar showMenu onBack={route.params?.backToHome ? () => resetTo("home") : undefined} />
      <PageScroll>
        <Text style={typography.caption}>{new Date(record.date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</Text>
        <View style={styles.detailChips}>{record.emotions.map((emotion) => <EmotionChip key={emotion} emotion={emotion} selected />)}</View>
        {record.body ? <Card style={styles.detailCard}><Text style={typography.body}>{record.body}</Text></Card> : null}
        <Text style={[typography.section, styles.comfortLabel]}>루민의 위로</Text>
        <View style={styles.comfortCard}><Logo size={34} /><Text style={styles.comfortText}>{record.comfortMessage}</Text></View>
        {record.syncStatus !== "synced" ? (
          <View style={styles.syncNotice} accessibilityLiveRegion="polite">
            <Text style={styles.syncNoticeTitle}>{syncLabel(record.syncStatus)}</Text>
            <Text style={typography.caption}>{record.syncMessage ?? "서버 동기화를 기다리고 있어요."}</Text>
            {record.syncStatus !== "conflict" && record.syncStatus !== "local" ? (
              <Pressable accessibilityRole="button" onPress={() => {
                setActionError(null);
                void retryJournal(record.date).catch((error) => setActionError(error instanceof Error ? error.message : "다시 시도하지 못했어요."));
              }}><Text style={styles.retryText}>지금 다시 시도</Text></Pressable>
            ) : null}
          </View>
        ) : null}
        {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
        {record.date === localIsoDay() ? <View style={styles.editButton}><PrimaryButton variant="outline" label="오늘 기록 수정하기" onPress={() => navigate("diary")} /></View> : null}
        <View style={styles.deleteButton}><PrimaryButton variant="danger" label="기록 삭제" onPress={() => {
          void deleteJournal(record).then(() => resetTo("records")).catch((error) => setActionError(error instanceof Error ? error.message : "삭제하지 못했어요."));
        }} /></View>
      </PageScroll>
    </Page>
  );
}

const styles = StyleSheet.create({
  diaryTitle: { marginTop: 3 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 22 },
  customRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  customInput: { flex: 1, minHeight: 44, backgroundColor: tokens.white, borderRadius: 22, borderWidth: 1, borderColor: tokens.outline, paddingHorizontal: 15, color: tokens.text },
  addButton: { minWidth: 64, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: tokens.primary },
  addText: { color: tokens.primary, fontWeight: "700" },
  fieldLabel: { fontSize: 14, fontWeight: "700", color: tokens.text, marginTop: 26, marginBottom: 9 },
  diaryInput: { minHeight: 170, borderRadius: 18, borderWidth: 1, borderColor: tokens.outline, backgroundColor: tokens.white, padding: 15, color: tokens.text, fontSize: 14, lineHeight: 22 },
  counter: { ...typography.caption, textAlign: "right", marginTop: 5 },
  notice: { backgroundColor: tokens.primaryLight, borderWidth: 1, borderColor: tokens.outline, padding: 12, borderRadius: 12, marginTop: 12 },
  noticeText: { ...typography.caption, color: tokens.primaryDark },
  errorNotice: { backgroundColor: "#FFF1F1", borderWidth: 1, borderColor: tokens.danger, padding: 12, borderRadius: 12, marginTop: 12, gap: 6 },
  errorText: { ...typography.caption, color: tokens.danger },
  retryText: { color: tokens.primary, fontSize: 13, fontWeight: "700", paddingVertical: 3 },
  bottomAction: { paddingHorizontal: 20, paddingBottom: 12 },
  overlay: { flex: 1, backgroundColor: "rgba(82,62,114,0.96)", alignItems: "center", justifyContent: "center", paddingHorizontal: 34 },
  overlayMark: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  overlayCheck: { color: tokens.white, fontSize: 40 },
  overlayTitle: { ...typography.title, color: tokens.white, marginTop: 18 },
  overlayChips: { flexDirection: "row", gap: 6, marginTop: 13 },
  overlayChip: { backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
  overlayChipText: { color: tokens.white, fontSize: 12 },
  overlayMessage: { color: "rgba(255,255,255,0.9)", fontSize: 14, lineHeight: 22, textAlign: "center", marginTop: 18 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30, paddingVertical: 70 },
  emptyEmoji: { fontSize: 44, marginBottom: 12 },
  detailChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 20 },
  detailCard: { marginBottom: 22 },
  comfortLabel: { color: tokens.textMuted, marginBottom: 9 },
  comfortCard: { flexDirection: "row", gap: 12, alignItems: "flex-start", backgroundColor: tokens.primaryLight, borderWidth: 1, borderColor: tokens.outline, borderRadius: 18, padding: 17 },
  comfortText: { flex: 1, color: tokens.primaryDark, fontSize: 14, lineHeight: 22 },
  editButton: { marginTop: 24 },
  deleteButton: { marginTop: 12, marginBottom: 20 },
  syncNotice: { backgroundColor: tokens.primaryLight, borderRadius: 14, borderWidth: 1, borderColor: tokens.outline, padding: 13, marginTop: 16, gap: 4 },
  syncNoticeTitle: { color: tokens.primaryDark, fontSize: 13, fontWeight: "700" },
  actionError: { color: tokens.danger, fontSize: 12, marginTop: 8 }
});

function syncLabel(status: "local" | "pending" | "failed" | "conflict") {
  if (status === "local") return "기기에만 저장";
  if (status === "pending") return "동기화 대기";
  if (status === "conflict") return "변경 충돌";
  return "동기화 실패";
}
