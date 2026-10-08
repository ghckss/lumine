import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { BottomTabs, Card, EmotionChip, Page, TopBar, typography } from "../../components/NativeUI";
import { tokens } from "../../config/tokens";
import { useApp } from "../../context/AppContext";
import { buildMonthGrid, localIsoDate, monthRange, shiftMonth } from "../../lib/calendar-date";
import { groupJournalRecordsByDate } from "../../lib/journal-explorer";
import { getEmotionColor, type JournalRecord } from "../../types/content";

const weekdays = ["월", "화", "수", "목", "금", "토", "일"];

export function RecordsScreen() {
  const { goBack, journalRecords, loadJournalRange, navigate, resetTo, stack } = useApp();
  const today = localIsoDate();
  const [selectedMonth, setSelectedMonth] = useState(monthRange(today).start);
  const [selectedDate, setSelectedDate] = useState<string | null>(today);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState(Number(today.slice(0, 4)));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingRange, setIsLoadingRange] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const requestSequence = useRef(0);
  const calendarRange = useMemo(() => monthRange(selectedMonth), [selectedMonth]);
  const grid = useMemo(() => buildMonthGrid(selectedMonth), [selectedMonth]);

  useEffect(() => {
    const sequence = ++requestSequence.current;
    setIsLoadingRange(true);
    setLoadError(null);
    loadJournalRange(calendarRange.start, calendarRange.end)
      .catch(() => { if (requestSequence.current === sequence) setLoadError("기록을 불러오지 못했어요. 보관된 기록을 먼저 보여드려요."); })
      .finally(() => { if (requestSequence.current === sequence) setIsLoadingRange(false); });
  }, [calendarRange.end, calendarRange.start, loadJournalRange, reloadKey]);

  const recordsByDate = useMemo(() => groupJournalRecordsByDate(journalRecords, calendarRange), [calendarRange, journalRecords]);
  const selectedRecords = selectedDate ? recordsByDate.get(selectedDate) ?? [] : [];

  function selectMonth(month: string) {
    const nextMonth = monthRange(month).start;
    setSelectedMonth(nextMonth);
    setSelectedDate(today >= monthRange(nextMonth).start && today <= monthRange(nextMonth).end ? today : null);
  }

  function openMonthPicker() {
    setPickerYear(Number(selectedMonth.slice(0, 4)));
    setPickerVisible(true);
  }

  function handleBack() {
    if (stack.length > 1) goBack();
    else resetTo("home");
  }

  return (
    <Page>
      <TopBar title="마음기록 전체보기" onBack={handleBack} />
      <FlatList
        data={selectedRecords}
        keyExtractor={(record) => record.id}
        renderItem={({ item }) => <RecordRow record={item} onPress={() => navigate("record-detail", { recordId: item.id })} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<>
        <View style={styles.header}>
          <View><Text style={typography.title}>내 마음기록</Text><Text style={typography.caption}>달력에서 날짜를 선택해 기록을 확인하세요.</Text></View>
          <Pressable accessibilityRole="button" onPress={() => navigate("diary")} style={styles.newButton}><Text style={styles.newButtonText}>＋ 새 기록</Text></Pressable>
        </View>

        <Card style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel="이전 달" onPress={() => selectMonth(shiftMonth(selectedMonth, -1))} style={styles.monthButton}><Text style={styles.monthArrow}>‹</Text></Pressable>
            <View style={styles.monthTitleGroup}>
              <Pressable accessibilityRole="button" accessibilityLabel={`${monthLabel(selectedMonth)} 연도와 월 선택`} accessibilityState={{ expanded: pickerVisible }} onPress={openMonthPicker} style={styles.monthTitleButton}><Text style={styles.monthTitle}>{monthLabel(selectedMonth)}⌄</Text></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="오늘로 이동" onPress={() => selectMonth(today)}><Text style={styles.todayLink}>오늘</Text></Pressable>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="다음 달" onPress={() => selectMonth(shiftMonth(selectedMonth, 1))} style={styles.monthButton}><Text style={styles.monthArrow}>›</Text></Pressable>
          </View>
          <View style={styles.calendarGrid}>{weekdays.map((weekday) => <Text key={weekday} style={styles.weekday}>{weekday}</Text>)}</View>
          <View style={styles.calendarGrid}>
            {grid.map((day) => {
              const dayRecords = recordsByDate.get(day.date) ?? [];
              const record = dayRecords[0];
              const selected = day.date === selectedDate;
              return (
                <Pressable
                  key={day.date}
                  accessibilityRole={day.inMonth ? "button" : undefined}
                  accessibilityLabel={record ? `${day.date}, ${record.emotions[0]} 기록 ${dayRecords.length}개` : `${day.date}, 기록 없음`}
                  accessibilityState={{ selected, disabled: !day.inMonth }}
                  disabled={!day.inMonth}
                  onPress={() => setSelectedDate(day.date)}
                  style={[styles.dayCell, !day.inMonth && styles.outsideDay, selected && styles.selectedDay]}
                >
                  <Text style={[styles.dayNumber, day.date === today && styles.todayNumber, selected && styles.selectedDayNumber]}>{day.day}</Text>
                  {record ? <View style={[styles.emotionMark, { backgroundColor: `${getEmotionColor(record.emotions[0])}55`, borderColor: getEmotionColor(record.emotions[0]) }]}><Text numberOfLines={1} style={styles.emotionMarkText}>{record.emotions[0]}</Text></View> : null}
                </Pressable>
              );
            })}
          </View>
        </Card>

        <View style={styles.resultHeader}>
          <View><Text style={typography.section}>{selectedDate ? koreanDate(selectedDate) : "날짜를 선택해 주세요"}</Text><Text style={typography.caption}>{selectedDate ? `기록 ${selectedRecords.length}개` : monthLabel(selectedMonth)}</Text></View>
          {isLoadingRange ? <ActivityIndicator color={tokens.primary} /> : null}
        </View>
        {loadError ? <Pressable accessibilityRole="button" onPress={() => setReloadKey((value) => value + 1)} style={styles.loadError}><Text style={styles.errorText}>{loadError}</Text><Text style={styles.retryText}>다시 불러오기</Text></Pressable> : null}
        </>}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🗓️</Text>
            <Text style={typography.section}>{selectedDate ? "이 날짜에는 기록이 없어요" : "확인할 날짜를 선택해 주세요"}</Text>
            <Text style={[typography.muted, styles.center]}>{selectedDate === today ? "오늘의 마음을 기록하면 이곳에서 바로 확인할 수 있어요." : "기록이 표시된 날짜를 선택해 지난 마음을 돌아보세요."}</Text>
          </View>
        )}
      />
      <MonthPicker
        visible={pickerVisible}
        year={pickerYear}
        selectedMonth={selectedMonth}
        onChangeYear={setPickerYear}
        onClose={() => setPickerVisible(false)}
        onSelect={(month) => { selectMonth(month); setPickerVisible(false); }}
      />
      <BottomTabs />
    </Page>
  );
}

function MonthPicker({ visible, year, selectedMonth, onChangeYear, onClose, onSelect }: {
  visible: boolean;
  year: number;
  selectedMonth: string;
  onChangeYear: (year: number) => void;
  onClose: () => void;
  onSelect: (month: string) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Card style={styles.pickerCard}>
          <View style={styles.pickerYearRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="이전 연도" onPress={() => onChangeYear(year - 1)} style={styles.pickerYearButton}><Text style={styles.pickerYearArrow}>‹</Text></Pressable>
            <Text accessibilityRole="header" style={styles.pickerYear}>{year}년</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="다음 연도" onPress={() => onChangeYear(year + 1)} style={styles.pickerYearButton}><Text style={styles.pickerYearArrow}>›</Text></Pressable>
          </View>
          <View style={styles.pickerMonths}>
            {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => {
              const value = `${year}-${String(month).padStart(2, "0")}-01`;
              const selected = value === selectedMonth;
              return (
                <Pressable
                  key={month}
                  accessibilityRole="button"
                  accessibilityLabel={`${year}년 ${month}월 선택`}
                  accessibilityState={{ selected }}
                  onPress={() => onSelect(value)}
                  style={({ pressed }) => [styles.pickerMonth, selected && styles.pickerMonthSelected, pressed && styles.pressed]}
                >
                  <Text style={[styles.pickerMonthText, selected && styles.pickerMonthTextSelected]}>{month}월</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="연도와 월 선택 닫기" onPress={onClose} style={styles.pickerClose}><Text style={styles.pickerCloseText}>닫기</Text></Pressable>
        </Card>
      </View>
    </Modal>
  );
}

function RecordRow({ record, onPress }: { record: JournalRecord; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${record.date} 기록 보기`} onPress={onPress} style={({ pressed }) => [styles.record, pressed && styles.pressed]}>
      <View style={styles.dateSide}><Text style={styles.dateNumber}>{Number(record.date.slice(-2))}</Text><View style={[styles.dot, { backgroundColor: getEmotionColor(record.emotions[0]) }]} /></View>
      <View style={styles.recordMain}><View style={styles.recordChips}>{record.emotions.map((emotion) => <EmotionChip key={emotion} emotion={emotion} />)}</View><Text style={styles.recordText}>{record.body || "본문 없음"}</Text><Text style={typography.caption}>{koreanDate(record.date)}</Text></View>
      {record.syncStatus !== "synced" ? <Text style={styles.syncBadge}>{syncLabel(record.syncStatus)}</Text> : null}
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

function monthLabel(value: string) { const [year, month] = value.split("-").map(Number); return `${year}년 ${month}월`; }
function koreanDate(value: string) { const [year, month, day] = value.split("-").map(Number); return `${year}년 ${month}월 ${day}일`; }
function syncLabel(status: JournalRecord["syncStatus"]) { return status === "local" ? "기기에만 저장" : status === "pending" ? "동기화 대기" : status === "conflict" ? "변경 충돌" : "동기화 실패"; }

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  newButton: { backgroundColor: tokens.primary, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  newButtonText: { color: tokens.white, fontSize: 13, fontWeight: "700" },
  calendarCard: { paddingHorizontal: 9 },
  monthHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  monthButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  monthArrow: { color: tokens.primary, fontSize: 30 },
  monthTitleGroup: { alignItems: "center" },
  monthTitleButton: { minHeight: 36, minWidth: 132, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  monthTitle: { ...typography.section, fontSize: 18 },
  todayLink: { color: tokens.primary, fontSize: 11, fontWeight: "700", paddingTop: 3 },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  weekday: { width: "14.2857%", textAlign: "center", ...typography.caption, paddingBottom: 7 },
  dayCell: { width: "14.2857%", minHeight: 62, alignItems: "center", paddingTop: 5, paddingHorizontal: 2, opacity: 1 },
  outsideDay: { opacity: 0.25 },
  selectedDay: { backgroundColor: tokens.primaryLight, borderRadius: 12 },
  dayNumber: { fontSize: 12, color: tokens.text },
  todayNumber: { color: tokens.primary, fontWeight: "800" },
  selectedDayNumber: { color: tokens.primaryDark, fontWeight: "800" },
  emotionMark: { maxWidth: "100%", borderWidth: 1, borderRadius: 7, marginTop: 4, paddingHorizontal: 3, paddingVertical: 2 },
  emotionMarkText: { color: tokens.text, fontSize: 8, fontWeight: "700" },
  errorText: { color: tokens.danger, fontSize: 12, lineHeight: 18 },
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
  modalOverlay: { flex: 1, backgroundColor: "rgba(20, 13, 33, 0.38)", alignItems: "center", justifyContent: "center", padding: 24 },
  pickerCard: { width: "100%", maxWidth: 360, gap: 14 },
  pickerYearRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pickerYearButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  pickerYearArrow: { color: tokens.primary, fontSize: 30 },
  pickerYear: { ...typography.title, fontSize: 20 },
  pickerMonths: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pickerMonth: { width: "22%", minHeight: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: tokens.outline, borderRadius: 12 },
  pickerMonthSelected: { backgroundColor: tokens.primary, borderColor: tokens.primary },
  pickerMonthText: { color: tokens.text, fontSize: 14, fontWeight: "600" },
  pickerMonthTextSelected: { color: tokens.white, fontWeight: "800" },
  pickerClose: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  pickerCloseText: { color: tokens.primary, fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] }
});
