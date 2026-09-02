import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { tokens } from "../../config/tokens";
import { useApp } from "../../context/AppContext";
import { BottomTabs, Card, EmotionChip, Logo, Page, PageScroll, PrimaryButton, TopBar, typography } from "../../components/NativeUI";
import { emotions, getEmotionColor } from "../../types/content";

function localIsoDay() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DiaryScreen() {
  const { journalRecords, saveJournal, navigate } = useApp();
  const today = localIsoDay();
  const existing = journalRecords.find((record) => record.date === today);
  const [selected, setSelected] = useState(existing?.emotions ?? []);
  const [body, setBody] = useState(existing?.body ?? "");
  const [custom, setCustom] = useState("");
  const [customEmotions, setCustomEmotions] = useState<string[]>(existing?.emotions.filter((emotion) => !emotions.includes(emotion)) ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelected(existing?.emotions ?? []);
    setBody(existing?.body ?? "");
    setCustom("");
    setCustomEmotions(existing?.emotions.filter((emotion) => !emotions.includes(emotion)) ?? []);
  }, [existing?.id]);

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
    try {
      const record = await saveJournal({ date: today, emotions: selected, body });
      setSavedMessage(record.comfortMessage);
      setTimeout(() => {
        setSavedMessage(null);
        navigate("record-detail", { recordId: record.id, backToHome: true });
      }, 1800);
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

export function RecordsScreen() {
  const { journalRecords, navigate } = useApp();
  const top = useMemo(() => {
    const counts = new Map<string, number>();
    journalRecords.slice(0, 10).forEach((record) => record.emotions.forEach((emotion) => counts.set(emotion, (counts.get(emotion) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2);
  }, [journalRecords]);

  return (
    <Page>
      <PageScroll contentStyle={styles.recordsContent}>
        <View style={styles.recordsHeader}>
          <Text style={typography.title}>내 마음기록</Text>
          <Pressable onPress={() => navigate("diary")} style={styles.newButton}><Text style={styles.newButtonText}>＋ 새 기록</Text></Pressable>
        </View>
        {journalRecords.length === 0 ? (
          <View style={styles.empty}>
            <Logo size={92} />
            <Text style={[typography.title, styles.emptyTitle]}>아직 기록이 없어요</Text>
            <Text style={[typography.muted, styles.center]}>오늘의 감정을 처음으로 기록해보세요.{"\n"}작은 기록이 큰 위로가 돼요.</Text>
            <View style={styles.emptyButton}><PrimaryButton label="첫 기록 남기기" onPress={() => navigate("diary")} /></View>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <Card style={styles.statCard}><Text style={typography.caption}>자주 느낀 감정</Text><View style={styles.statChips}>{top.map(([emotion, count]) => <View key={emotion}><EmotionChip emotion={`${emotion} ${count}회`} /></View>)}</View></Card>
              <Card style={styles.statCard}><Text style={typography.caption}>감정 흐름</Text><Text style={styles.trend}>➡️</Text><Text style={styles.trendText}>감정의 흐름을 기록하고 있어요</Text></Card>
            </View>
            <Text style={[typography.section, styles.listTitle]}>최근 기록 ({journalRecords.length}개)</Text>
            {journalRecords.slice(0, 30).map((record) => (
              <Pressable key={record.id} onPress={() => navigate("record-detail", { recordId: record.id })} style={({ pressed }) => [styles.record, pressed && styles.pressed]}>
                <View style={styles.dateSide}><Text style={typography.caption}>{new Date(record.date).toLocaleDateString("ko-KR", { weekday: "short" })}</Text><Text style={styles.dateNumber}>{new Date(record.date).getDate()}</Text><View style={[styles.dot, { backgroundColor: getEmotionColor(record.emotions[0]) }]} /></View>
                <View style={styles.recordMain}><View style={styles.recordChips}>{record.emotions.map((emotion) => <EmotionChip key={emotion} emotion={emotion} />)}</View><Text style={styles.recordText} numberOfLines={2}>{record.body || "본문 없음"}</Text><Text style={typography.caption}>{new Date(record.date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</Text></View>
                <Text style={styles.arrow}>›</Text>
              </Pressable>
            ))}
          </>
        )}
      </PageScroll>
      <BottomTabs />
    </Page>
  );
}

export function RecordDetailScreen() {
  const { route, journalRecords, navigate, resetTo } = useApp();
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
        {record.date === localIsoDay() ? <View style={styles.editButton}><PrimaryButton variant="outline" label="오늘 기록 수정하기" onPress={() => navigate("diary")} /></View> : null}
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
  bottomAction: { paddingHorizontal: 20, paddingBottom: 12 },
  overlay: { flex: 1, backgroundColor: "rgba(82,62,114,0.96)", alignItems: "center", justifyContent: "center", paddingHorizontal: 34 },
  overlayMark: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  overlayCheck: { color: tokens.white, fontSize: 40 },
  overlayTitle: { ...typography.title, color: tokens.white, marginTop: 18 },
  overlayChips: { flexDirection: "row", gap: 6, marginTop: 13 },
  overlayChip: { backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
  overlayChipText: { color: tokens.white, fontSize: 12 },
  overlayMessage: { color: "rgba(255,255,255,0.9)", fontSize: 14, lineHeight: 22, textAlign: "center", marginTop: 18 },
  recordsContent: { paddingTop: 18 },
  recordsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  newButton: { backgroundColor: tokens.primary, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  newButtonText: { color: tokens.white, fontSize: 13, fontWeight: "700" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30, paddingVertical: 70 },
  emptyTitle: { marginTop: 18, marginBottom: 8 },
  center: { textAlign: "center" },
  emptyButton: { width: 200, marginTop: 22 },
  emptyEmoji: { fontSize: 44, marginBottom: 12 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, minHeight: 108 },
  statChips: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 10 },
  trend: { fontSize: 20, marginTop: 8 },
  trendText: { fontSize: 11, color: tokens.text, marginTop: 2 },
  listTitle: { marginTop: 20, marginBottom: 10 },
  record: { flexDirection: "row", gap: 12, backgroundColor: tokens.white, borderWidth: 1, borderColor: tokens.outline, borderRadius: 18, padding: 14, marginBottom: 10 },
  dateSide: { width: 38, alignItems: "center" },
  dateNumber: { fontFamily: "serif", color: tokens.text, fontSize: 20, fontWeight: "700" },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 3 },
  recordMain: { flex: 1 },
  recordChips: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 6 },
  recordText: { ...typography.body, color: tokens.textMuted, marginBottom: 5 },
  arrow: { alignSelf: "center", color: tokens.outline, fontSize: 25 },
  detailChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 20 },
  detailCard: { marginBottom: 22 },
  comfortLabel: { color: tokens.textMuted, marginBottom: 9 },
  comfortCard: { flexDirection: "row", gap: 12, alignItems: "flex-start", backgroundColor: tokens.primaryLight, borderWidth: 1, borderColor: tokens.outline, borderRadius: 18, padding: 17 },
  comfortText: { flex: 1, color: tokens.primaryDark, fontSize: 14, lineHeight: 22 },
  editButton: { marginTop: 24 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] }
});
