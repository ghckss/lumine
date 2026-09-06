import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { BottomTabs, Card, EmotionChip, Page, PrimaryButton, typography } from "../../components/NativeUI";
import { tokens } from "../../config/tokens";
import { useApp } from "../../context/AppContext";
import { buildMonthGrid, localIsoDate, monthRange, shiftMonth } from "../../lib/calendar-date";
import { collectEmotionOptions, filterJournalRecords, validateDateRange } from "../../lib/journal-explorer";
import { emotions, getEmotionColor, type JournalRecord } from "../../types/content";

const weekdays = ["월", "화", "수", "목", "금", "토", "일"];

export function RecordsScreen() {
  const { journalRecords, loadJournalRange, navigate } = useApp();
  const today = localIsoDate();
  const [selectedMonth, setSelectedMonth] = useState(monthRange(today).start);
  const [query, setQuery] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [customRange, setCustomRange] = useState<{ start: string; end: string } | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingRange, setIsLoadingRange] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const requestSequence = useRef(0);
  const calendarRange = useMemo(() => monthRange(selectedMonth), [selectedMonth]);
  const effectiveRange = customRange ?? calendarRange;
  const grid = useMemo(() => buildMonthGrid(selectedMonth), [selectedMonth]);

  useEffect(() => {
    const sequence = ++requestSequence.current;
    setIsLoadingRange(true);
    setLoadError(null);
    const ranges = customRange && (customRange.start !== calendarRange.start || customRange.end !== calendarRange.end)
      ? [calendarRange, customRange]
      : [calendarRange];
    Promise.all(ranges.map((range) => loadJournalRange(range.start, range.end)))
      .catch(() => { if (requestSequence.current === sequence) setLoadError("기록을 불러오지 못했어요. 보관된 기록을 먼저 보여드려요."); })
      .finally(() => { if (requestSequence.current === sequence) setIsLoadingRange(false); });
  }, [calendarRange.end, calendarRange.start, customRange?.end, customRange?.start, loadJournalRange, reloadKey]);

  const monthRecords = useMemo(() => filterJournalRecords(journalRecords, calendarRange, { query: "", emotions: [] }), [calendarRange, journalRecords]);
  const recordsByDate = useMemo(() => new Map(monthRecords.map((record) => [record.date, record])), [monthRecords]);
  const rangeRecords = useMemo(() => filterJournalRecords(journalRecords, effectiveRange, { query: "", emotions: [] }), [effectiveRange, journalRecords]);
  const emotionOptions = useMemo(() => {
    const options = collectEmotionOptions(rangeRecords, emotions);
    return [...options, ...selectedEmotions.filter((emotion) => !options.includes(emotion))];
  }, [rangeRecords, selectedEmotions]);
  const results = useMemo(() => filterJournalRecords(journalRecords, effectiveRange, { query, emotions: selectedEmotions }), [effectiveRange, journalRecords, query, selectedEmotions]);
  const hasFilters = Boolean(query.trim() || selectedEmotions.length || customRange);

  function toggleEmotion(emotion: string) {
    setSelectedEmotions((current) => current.includes(emotion) ? current.filter((item) => item !== emotion) : [...current, emotion]);
  }

  function applyRange() {
    const error = validateDateRange(startInput.trim(), endInput.trim());
    setRangeError(error);
    if (error) return;
    if (!startInput.trim() && !endInput.trim()) {
      setCustomRange(null);
      return;
    }
    setCustomRange({ start: startInput.trim(), end: endInput.trim() });
  }

  function clearFilters() {
    setQuery("");
    setSelectedEmotions([]);
    setStartInput("");
    setEndInput("");
    setCustomRange(null);
    setRangeError(null);
  }

  return (
    <Page>
      <FlatList
        data={results}
        keyExtractor={(record) => record.id}
        renderItem={({ item }) => <RecordRow record={item} onPress={() => navigate("record-detail", { recordId: item.id })} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<>
        <View style={styles.header}>
          <Text style={typography.title}>내 마음기록</Text>
          <Pressable accessibilityRole="button" onPress={() => navigate("diary")} style={styles.newButton}><Text style={styles.newButtonText}>＋ 새 기록</Text></Pressable>
        </View>

        <Card style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel="이전 달" onPress={() => setSelectedMonth((month) => shiftMonth(month, -1))} style={styles.monthButton}><Text style={styles.monthArrow}>‹</Text></Pressable>
            <View style={styles.monthTitleGroup}><Text style={styles.monthTitle}>{monthLabel(selectedMonth)}</Text><Pressable onPress={() => setSelectedMonth(monthRange(today).start)}><Text style={styles.todayLink}>오늘</Text></Pressable></View>
            <Pressable accessibilityRole="button" accessibilityLabel="다음 달" onPress={() => setSelectedMonth((month) => shiftMonth(month, 1))} style={styles.monthButton}><Text style={styles.monthArrow}>›</Text></Pressable>
          </View>
          <View style={styles.calendarGrid}>{weekdays.map((weekday) => <Text key={weekday} style={styles.weekday}>{weekday}</Text>)}</View>
          <View style={styles.calendarGrid}>
            {grid.map((day) => {
              const record = recordsByDate.get(day.date);
              return (
                <Pressable
                  key={day.date}
                  accessibilityRole={record ? "button" : undefined}
                  accessibilityLabel={record ? `${day.date}, ${record.emotions[0]} 기록 보기` : day.date}
                  disabled={!day.inMonth || !record}
                  onPress={() => record && navigate("record-detail", { recordId: record.id })}
                  style={[styles.dayCell, !day.inMonth && styles.outsideDay]}
                >
                  <Text style={[styles.dayNumber, day.date === today && styles.todayNumber]}>{day.day}</Text>
                  {record ? <View style={[styles.emotionMark, { backgroundColor: `${getEmotionColor(record.emotions[0])}55`, borderColor: getEmotionColor(record.emotions[0]) }]}><Text numberOfLines={1} style={styles.emotionMarkText}>{record.emotions[0]}</Text></View> : null}
                </Pressable>
              );
            })}
          </View>
        </Card>

        <TextInput
          accessibilityLabel="일기 본문 검색"
          value={query}
          onChangeText={setQuery}
          placeholder="일기 본문에서 검색"
          placeholderTextColor={tokens.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
        />

        <Card style={styles.filterCard}>
          <View style={styles.filterHeader}><Text style={typography.section}>감정과 기간</Text>{hasFilters ? <Pressable onPress={clearFilters}><Text style={styles.clearText}>전체 초기화</Text></Pressable> : null}</View>
          {emotionOptions.length ? <View style={styles.chips}>{emotionOptions.map((emotion) => <EmotionChip key={emotion} emotion={emotion} selected={selectedEmotions.includes(emotion)} onPress={() => toggleEmotion(emotion)} />)}</View> : <Text style={typography.caption}>현재 범위에 기록된 감정이 없어요.</Text>}
          <View style={styles.rangeRow}>
            <TextInput accessibilityLabel="조회 시작일" value={startInput} onChangeText={setStartInput} placeholder="YYYY-MM-DD" placeholderTextColor={tokens.textMuted} autoCapitalize="none" maxLength={10} style={styles.dateInput} />
            <Text style={styles.rangeDash}>~</Text>
            <TextInput accessibilityLabel="조회 종료일" value={endInput} onChangeText={setEndInput} placeholder="YYYY-MM-DD" placeholderTextColor={tokens.textMuted} autoCapitalize="none" maxLength={10} style={styles.dateInput} />
          </View>
          {rangeError ? <Text accessibilityLiveRegion="polite" style={styles.errorText}>{rangeError}</Text> : null}
          <View style={styles.applyButton}><PrimaryButton variant="outline" label="기간 적용" onPress={applyRange} /></View>
        </Card>

        <View style={styles.resultHeader}>
          <View><Text style={typography.section}>{hasFilters ? "검색 결과" : "이 기간의 기록"} {results.length}개</Text><Text style={typography.caption}>{rangeLabel(effectiveRange.start, effectiveRange.end)}</Text></View>
          {isLoadingRange ? <ActivityIndicator color={tokens.primary} /> : null}
        </View>
        {loadError ? <Pressable accessibilityRole="button" onPress={() => setReloadKey((value) => value + 1)} style={styles.loadError}><Text style={styles.errorText}>{loadError}</Text><Text style={styles.retryText}>다시 불러오기</Text></Pressable> : null}
        </>}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🗓️</Text>
            <Text style={typography.section}>{hasFilters ? "조건에 맞는 기록이 없어요" : "이 기간에는 기록이 없어요"}</Text>
            <Text style={[typography.muted, styles.center]}>{hasFilters ? "조건을 바꾸거나 전체 초기화를 해보세요." : "오늘의 마음부터 천천히 남겨보세요."}</Text>
            <View style={styles.emptyButton}><PrimaryButton variant={hasFilters ? "outline" : "primary"} label={hasFilters ? "필터 초기화" : "기록 남기기"} onPress={hasFilters ? clearFilters : () => navigate("diary")} /></View>
          </View>
        )}
      />
      <BottomTabs />
    </Page>
  );
}

function RecordRow({ record, onPress }: { record: JournalRecord; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${record.date} 기록 보기`} onPress={onPress} style={({ pressed }) => [styles.record, pressed && styles.pressed]}>
      <View style={styles.dateSide}><Text style={styles.dateNumber}>{Number(record.date.slice(-2))}</Text><View style={[styles.dot, { backgroundColor: getEmotionColor(record.emotions[0]) }]} /></View>
      <View style={styles.recordMain}><View style={styles.recordChips}>{record.emotions.map((emotion) => <EmotionChip key={emotion} emotion={emotion} />)}</View><Text style={styles.recordText} numberOfLines={2}>{record.body || "본문 없음"}</Text><Text style={typography.caption}>{koreanDate(record.date)}</Text></View>
      {record.syncStatus !== "synced" ? <Text style={styles.syncBadge}>{syncLabel(record.syncStatus)}</Text> : null}
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

function monthLabel(value: string) { const [year, month] = value.split("-").map(Number); return `${year}년 ${month}월`; }
function koreanDate(value: string) { const [year, month, day] = value.split("-").map(Number); return `${year}년 ${month}월 ${day}일`; }
function rangeLabel(start: string, end: string) { return `${koreanDate(start)} ~ ${koreanDate(end)}`; }
function syncLabel(status: JournalRecord["syncStatus"]) { return status === "local" ? "기기에만 저장" : status === "pending" ? "동기화 대기" : status === "conflict" ? "변경 충돌" : "동기화 실패"; }

const styles = StyleSheet.create({
  content: { paddingTop: 18 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  newButton: { backgroundColor: tokens.primary, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  newButtonText: { color: tokens.white, fontSize: 13, fontWeight: "700" },
  calendarCard: { paddingHorizontal: 9 },
  monthHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  monthButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  monthArrow: { color: tokens.primary, fontSize: 30 },
  monthTitleGroup: { alignItems: "center" },
  monthTitle: { ...typography.section, fontSize: 18 },
  todayLink: { color: tokens.primary, fontSize: 11, fontWeight: "700", paddingTop: 3 },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  weekday: { width: "14.2857%", textAlign: "center", ...typography.caption, paddingBottom: 7 },
  dayCell: { width: "14.2857%", minHeight: 62, alignItems: "center", paddingTop: 5, paddingHorizontal: 2, opacity: 1 },
  outsideDay: { opacity: 0.25 },
  dayNumber: { fontSize: 12, color: tokens.text },
  todayNumber: { color: tokens.primary, fontWeight: "800" },
  emotionMark: { maxWidth: "100%", borderWidth: 1, borderRadius: 7, marginTop: 4, paddingHorizontal: 3, paddingVertical: 2 },
  emotionMarkText: { color: tokens.text, fontSize: 8, fontWeight: "700" },
  searchInput: { minHeight: 48, backgroundColor: tokens.white, borderWidth: 1, borderColor: tokens.outline, borderRadius: 16, color: tokens.text, paddingHorizontal: 15, marginTop: 14 },
  filterCard: { marginTop: 12, gap: 12 },
  filterHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  clearText: { color: tokens.primary, fontSize: 12, fontWeight: "700", padding: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  rangeRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  dateInput: { flex: 1, minHeight: 44, borderWidth: 1, borderColor: tokens.outline, borderRadius: 12, backgroundColor: tokens.white, color: tokens.text, paddingHorizontal: 10, fontSize: 12 },
  rangeDash: { color: tokens.textMuted },
  errorText: { color: tokens.danger, fontSize: 12, lineHeight: 18 },
  applyButton: { minHeight: 44 },
  resultHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 10 },
  loadError: { backgroundColor: tokens.dangerLight, borderRadius: 12, padding: 12, marginBottom: 10 },
  retryText: { color: tokens.primary, fontSize: 12, fontWeight: "700", marginTop: 4 },
  record: { flexDirection: "row", gap: 10, backgroundColor: tokens.white, borderWidth: 1, borderColor: tokens.outline, borderRadius: 18, padding: 13, marginBottom: 10 },
  dateSide: { width: 30, alignItems: "center" },
  dateNumber: { fontFamily: "serif", color: tokens.text, fontSize: 20, fontWeight: "700" },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 3 },
  recordMain: { flex: 1 },
  recordChips: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 6 },
  recordText: { ...typography.body, color: tokens.textMuted, marginBottom: 5 },
  syncBadge: { alignSelf: "flex-start", color: tokens.primaryDark, backgroundColor: tokens.primaryLight, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4, fontSize: 10, fontWeight: "700" },
  arrow: { alignSelf: "center", color: tokens.outline, fontSize: 25 },
  empty: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 42, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  center: { textAlign: "center" },
  emptyButton: { width: 190, marginTop: 8 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] }
});
