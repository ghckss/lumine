import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BottomTabs, Card, EmotionChip, Page, TopBar, typography } from "../../components/NativeUI";
import { tokens } from "../../config/tokens";
import { useApp } from "../../context/AppContext";
import { buildMonthGrid, groupJournalRecordsByDate, localIsoDate, monthRange, shiftMonth } from "@lumine/domain";
import { getEmotionColor, type JournalRecord } from "../../types/content";

const weekdays = ["월", "화", "수", "목", "금", "토", "일"];

export function RecordsScreen() {
  const { goBack, journalRecords, loadJournalRange, navigate, recordsViewState, resetTo, stack, updateRecordsViewState } = useApp();
  const today = localIsoDate();
  const { selectedMonth, selectedDate } = recordsViewState;
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
  const hasTodayRecord = journalRecords.some((record) => record.date === today);

  function selectMonth(month: string) {
    const nextMonth = monthRange(month).start;
    updateRecordsViewState({
      selectedMonth: nextMonth,
      selectedDate: today >= monthRange(nextMonth).start && today <= monthRange(nextMonth).end ? today : null
    });
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={typography.title}>내 마음기록</Text><Text style={typography.caption}>달력에서 날짜를 선택해 기록을 확인하세요.</Text></View>
          {!hasTodayRecord ? <Pressable accessibilityRole="button" onPress={() => navigate("diary")} style={styles.newButton}><Text style={styles.newButtonText}>＋ 새 기록</Text></Pressable> : null}
        </View>

        <Card style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel="이전 달" onPress={() => selectMonth(shiftMonth(selectedMonth, -1))} style={styles.monthButton}><Text style={styles.monthArrow}>‹</Text></Pressable>
            <View style={styles.monthTitleGroup}>
              <Pressable accessibilityRole="button" accessibilityLabel={`${monthLabel(selectedMonth)} 연도와 월 선택`} accessibilityState={{ expanded: pickerVisible }} onPress={openMonthPicker} style={styles.monthTitleButton}><Text style={styles.monthTitle}>{monthLabel(selectedMonth)}</Text></Pressable>
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
                  onPress={() => updateRecordsViewState({ selectedDate: day.date })}
                  style={[styles.dayCell, !day.inMonth && styles.outsideDay, selected && styles.selectedDay]}
                >
                  <Text style={[styles.dayNumber, day.date === today && styles.todayNumber, selected && styles.selectedDayNumber]}>{day.day}</Text>
                  {record ? <View accessibilityElementsHidden style={[styles.emotionDot, { backgroundColor: getEmotionColor(record.emotions[0]) }]} /> : null}
                </Pressable>
              );
            })}
          </View>
        </Card>

        {loadError ? <Pressable accessibilityRole="button" onPress={() => setReloadKey((value) => value + 1)} style={styles.loadError}><Text style={styles.errorText}>{loadError}</Text><Text style={styles.retryText}>다시 불러오기</Text></Pressable> : null}
      </ScrollView>
      <SelectedDatePreview
        selectedDate={selectedDate}
        records={selectedRecords}
        isLoading={isLoadingRange}
        onOpen={(recordId) => navigate("record-detail", { recordId })}
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

function SelectedDatePreview({ selectedDate, records, isLoading, onOpen }: {
  selectedDate: string | null;
  records: JournalRecord[];
  isLoading: boolean;
  onOpen: (recordId: string) => void;
}) {
  return (
    <View style={styles.previewDock}>
      <View style={styles.previewHeader}>
        <View>
          <Text style={styles.previewDate}>{selectedDate ? koreanDate(selectedDate) : "날짜를 선택해 주세요"}</Text>
          <Text style={typography.caption}>{selectedDate ? `기록 ${records.length}개` : "선택한 날짜의 기록이 여기에 표시돼요"}</Text>
        </View>
        {isLoading ? <ActivityIndicator color={tokens.primary} /> : null}
      </View>
      {records.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewList}>
          {records.map((record) => (
            <Pressable key={record.id} accessibilityRole="button" accessibilityLabel={`${record.date} 기록 상세 보기`} onPress={() => onOpen(record.id)} style={({ pressed }) => [styles.previewCard, pressed && styles.pressed]}>
              <View style={styles.previewMeta}>
                <View style={styles.previewEmotions}>{record.emotions.map((emotion) => <EmotionChip key={emotion} emotion={emotion} />)}</View>
                {record.syncStatus !== "synced" ? <Text style={styles.syncBadge}>{syncLabel(record.syncStatus)}</Text> : null}
              </View>
              <Text style={styles.previewBody} numberOfLines={2}>{record.body || "본문 없이 감정만 기록했어요."}</Text>
              <Text style={styles.previewLink}>상세 보기 ›</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.previewEmpty}>
          <Text style={styles.previewEmptyIcon}>🗓️</Text>
          <Text style={typography.muted}>{selectedDate ? "이 날짜에는 기록이 없어요." : "달력에서 날짜를 선택해 주세요."}</Text>
        </View>
      )}
    </View>
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
  const [view, setView] = useState<"months" | "years">("months");
  const selectedYear = Number(selectedMonth.slice(0, 4));
  const yearOptions = Array.from({ length: 9 }, (_, index) => year - 4 + index);

  useEffect(() => {
    if (visible) setView("months");
  }, [visible]);

  const moveYearPage = (direction: -1 | 1) => onChangeYear(year + direction * (view === "years" ? 9 : 1));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Card style={styles.pickerCard}>
          <View style={styles.pickerYearRow}>
            <Pressable accessibilityRole="button" accessibilityLabel={view === "years" ? "이전 연도 범위" : "이전 연도"} onPress={() => moveYearPage(-1)} style={styles.pickerYearButton}><Text style={styles.pickerYearArrow}>‹</Text></Pressable>
            {view === "months" ? (
              <Pressable accessibilityRole="button" accessibilityLabel={`${year}년, 연도 선택 열기`} onPress={() => setView("years")} style={styles.pickerYearTitleButton}>
                <Text style={styles.pickerYear}>{year}년</Text>
              </Pressable>
            ) : <Text accessibilityRole="header" style={styles.pickerYear}>{yearOptions[0]}–{yearOptions[8]}년</Text>}
            <Pressable accessibilityRole="button" accessibilityLabel={view === "years" ? "다음 연도 범위" : "다음 연도"} onPress={() => moveYearPage(1)} style={styles.pickerYearButton}><Text style={styles.pickerYearArrow}>›</Text></Pressable>
          </View>
          {view === "months" ? <View style={styles.pickerMonths}>
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
          </View> : <View style={styles.pickerYears}>
            {yearOptions.map((option) => {
              const selected = option === selectedYear;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityLabel={`${option}년 선택`}
                  accessibilityState={{ selected }}
                  onPress={() => { onChangeYear(option); setView("months"); }}
                  style={({ pressed }) => [styles.pickerYearOption, selected && styles.pickerMonthSelected, pressed && styles.pressed]}
                >
                  <Text style={[styles.pickerMonthText, selected && styles.pickerMonthTextSelected]}>{option}년</Text>
                </Pressable>
              );
            })}
          </View>}
          <Pressable accessibilityRole="button" accessibilityLabel="연도와 월 선택 닫기" onPress={onClose} style={styles.pickerClose}><Text style={styles.pickerCloseText}>닫기</Text></Pressable>
        </Card>
      </View>
    </Modal>
  );
}

function monthLabel(value: string) { const [year, month] = value.split("-").map(Number); return `${year}년 ${month}월`; }
function koreanDate(value: string) { const [year, month, day] = value.split("-").map(Number); return `${year}년 ${month}월 ${day}일`; }
function syncLabel(status: JournalRecord["syncStatus"]) { return status === "local" ? "기기에만 저장" : status === "pending" ? "동기화 대기" : status === "conflict" ? "변경 충돌" : "동기화 실패"; }

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  newButton: { backgroundColor: tokens.primary, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  newButtonText: { color: tokens.white, fontSize: 13, fontWeight: "700" },
  calendarCard: { paddingHorizontal: 9 },
  monthHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 7 },
  monthButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  monthArrow: { color: tokens.primary, fontSize: 30 },
  monthTitleGroup: { alignItems: "center" },
  monthTitleButton: { minHeight: 36, minWidth: 132, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  monthTitle: { ...typography.section, fontSize: 18 },
  todayLink: { color: tokens.primary, fontSize: 11, fontWeight: "700", paddingTop: 3 },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  weekday: { width: "14.2857%", textAlign: "center", ...typography.caption, paddingBottom: 5 },
  dayCell: { width: "14.2857%", minHeight: 46, alignItems: "center", justifyContent: "center", paddingHorizontal: 2, opacity: 1 },
  outsideDay: { opacity: 0.25 },
  selectedDay: { backgroundColor: tokens.primaryLight, borderRadius: 12 },
  dayNumber: { fontSize: 12, color: tokens.text },
  todayNumber: { color: tokens.primary, fontWeight: "800" },
  selectedDayNumber: { color: tokens.primaryDark, fontWeight: "800" },
  emotionDot: { width: 7, height: 7, borderRadius: 4, marginTop: 4 },
  errorText: { color: tokens.danger, fontSize: 12, lineHeight: 18 },
  loadError: { backgroundColor: tokens.dangerLight, borderRadius: 12, padding: 12, marginTop: 10 },
  retryText: { color: tokens.primary, fontSize: 12, fontWeight: "700", marginTop: 4 },
  previewDock: { backgroundColor: tokens.white, borderTopWidth: 1, borderTopColor: tokens.outline, paddingHorizontal: 20, paddingTop: 11, paddingBottom: 10, minHeight: 140 },
  previewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  previewDate: { color: tokens.text, fontSize: 14, fontWeight: "800" },
  previewList: { gap: 9, paddingRight: 20 },
  previewCard: { width: 286, minHeight: 84, backgroundColor: tokens.background, borderWidth: 1, borderColor: tokens.outline, borderRadius: 15, paddingHorizontal: 12, paddingVertical: 9 },
  previewMeta: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  previewEmotions: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 4 },
  previewBody: { color: tokens.textMuted, fontSize: 12, lineHeight: 17, marginTop: 5, paddingRight: 8 },
  previewLink: { color: tokens.primary, fontSize: 11, fontWeight: "700", alignSelf: "flex-end", marginTop: 3 },
  previewEmpty: { minHeight: 76, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: tokens.background, borderRadius: 15 },
  previewEmptyIcon: { fontSize: 20 },
  syncBadge: { alignSelf: "flex-start", color: tokens.primaryDark, backgroundColor: tokens.primaryLight, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4, fontSize: 10, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(20, 13, 33, 0.38)", alignItems: "center", justifyContent: "center", padding: 24 },
  pickerCard: { width: "100%", maxWidth: 360, gap: 14 },
  pickerYearRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pickerYearButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  pickerYearArrow: { color: tokens.primary, fontSize: 30 },
  pickerYearTitleButton: { minHeight: 48, minWidth: 120, alignItems: "center", justifyContent: "center" },
  pickerYear: { ...typography.title, fontSize: 20 },
  pickerMonths: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pickerYears: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pickerYearOption: { width: "31%", minHeight: 52, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: tokens.outline, borderRadius: 12 },
  pickerMonth: { width: "22%", minHeight: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: tokens.outline, borderRadius: 12 },
  pickerMonthSelected: { backgroundColor: tokens.primary, borderColor: tokens.primary },
  pickerMonthText: { color: tokens.text, fontSize: 14, fontWeight: "600" },
  pickerMonthTextSelected: { color: tokens.white, fontWeight: "800" },
  pickerClose: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  pickerCloseText: { color: tokens.primary, fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] }
});
