import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "../../config/tokens";
import { useApp } from "../../context/AppContext";
import { useSession } from "../../context/SessionContext";
import { BottomTabs, Card, EmotionChip, Page, PageScroll, typography } from "../../components/NativeUI";
import { getEmotionColor } from "../../types/content";

function isoDay(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthDay(isoDate: string) {
  const [, month, day] = isoDate.split("-").map(Number);
  return `${month}/${day}`;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "잠 못 드는 밤이네요";
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "좋은 오후예요";
  return "오늘 하루도 수고했어요";
}

export function HomeScreen() {
  const { journalRecords, screeningResults, navigate, isLoading, isGuest } = useApp();
  const { session } = useSession();
  const displayName = isGuest ? "게스트" : session?.displayName ?? "루민";
  const lastDays = useMemo(() => Array.from({ length: 7 }, (_, index) => isoDay(index - 6)), []);
  const byDate = useMemo(() => new Map(journalRecords.map((record) => [record.date, record])), [journalRecords]);
  const recent = journalRecords.slice(0, 3);
  const lastScreeningDays = screeningResults[0]
    ? Math.floor((Date.now() - new Date(screeningResults[0].completedDate).getTime()) / 86400000)
    : Number.POSITIVE_INFINITY;
  const showScreeningReminder = screeningResults.length === 0 || lastScreeningDays >= 30;
  const topEmotions = useMemo(() => {
    const counts = new Map<string, number>();
    journalRecords.filter((record) => lastDays.includes(record.date)).forEach((record) => record.emotions.forEach((emotion) => counts.set(emotion, (counts.get(emotion) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([emotion]) => emotion);
  }, [journalRecords, lastDays]);

  return (
    <Page>
      <PageScroll contentStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={typography.muted}>{greeting()},</Text>
            <Text style={styles.name}>{displayName} 님</Text>
          </View>
          <Pressable onPress={() => navigate("menu")} style={styles.menuButton}><Text style={styles.menuText}>•••</Text></Pressable>
        </View>

        {isLoading ? <ActivityIndicator color={tokens.primary} style={styles.loader} /> : null}

        {showScreeningReminder ? (
          <Pressable onPress={() => navigate("check-start")} style={({ pressed }) => [styles.checkBanner, pressed && styles.pressed]}>
            <View style={styles.bannerIcon}><Text style={styles.bannerIconText}>♥</Text></View>
            <View style={styles.flex}>
              <Text style={styles.bannerTitle}>마음 상태 확인하기</Text>
              <Text style={styles.bannerBody}>{screeningResults.length === 0 ? "처음으로 내 마음을 확인해보세요" : `마지막 확인으로부터 ${lastScreeningDays}일이 지났어요`}</Text>
            </View>
            <Text style={styles.bannerArrow}>›</Text>
          </Pressable>
        ) : null}

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 7일 기록</Text>
            <Text style={styles.sectionLink}>{lastDays.filter((day) => byDate.has(day)).length}일 / 7일</Text>
          </View>
          <View style={styles.weekRow}>
            {lastDays.map((day) => {
              const record = byDate.get(day);
              const color = record ? getEmotionColor(record.emotions[0]) : tokens.background;
              return (
                <View key={day} style={styles.dayColumn}>
                  <View style={[styles.dayBox, { backgroundColor: record ? `${color}55` : tokens.background, borderColor: record ? color : "transparent" }]}>
                    <Text style={styles.dayEmotion}>{record ? record.emotions[0].slice(0, 2) : "—"}</Text>
                  </View>
                  <Text style={styles.dayLabel}>{monthDay(day)}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {topEmotions.length > 0 ? (
          <Card style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, styles.chipTitle]}>최근 자주 느낀 감정</Text>
            <View style={styles.chips}>{topEmotions.map((emotion) => <EmotionChip key={emotion} emotion={emotion} />)}</View>
          </Card>
        ) : null}

        <View style={styles.quickRow}>
          <Pressable onPress={() => navigate("diary")} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}>
            <Text style={styles.quickIcon}>✍️</Text><Text style={styles.quickTitle}>감정 일기</Text><Text style={styles.quickBody}>오늘의 감정을 기록해요</Text>
          </Pressable>
          <Pressable onPress={() => navigate("check-start")} style={({ pressed }) => [styles.quickCard, styles.quickTint, pressed && styles.pressed]}>
            <Text style={styles.quickIcon}>💜</Text><Text style={[styles.quickTitle, { color: tokens.primaryDark }]}>마음 확인</Text><Text style={styles.quickBody}>내 마음 상태 체크</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 감정 일기</Text>
          <Pressable onPress={() => navigate("records")}><Text style={styles.sectionLink}>전체 보기</Text></Pressable>
        </View>
        {recent.length === 0 ? (
          <Card style={styles.empty}><Text style={typography.muted}>아직 기록이 없어요</Text><Pressable onPress={() => navigate("diary")}><Text style={styles.emptyLink}>첫 기록 남기기</Text></Pressable></Card>
        ) : recent.map((record) => (
          <Pressable key={record.id} onPress={() => navigate("record-detail", { recordId: record.id })} style={({ pressed }) => [styles.recordCard, pressed && styles.pressed]}>
            <View style={styles.sectionHeader}>
              <Text style={typography.caption}>{new Date(record.date).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}</Text>
              <View style={styles.miniChips}>{record.emotions.slice(0, 2).map((emotion) => <EmotionChip key={emotion} emotion={emotion} />)}</View>
            </View>
            <Text style={styles.recordBody} numberOfLines={2}>{record.body || "오늘의 감정을 기록했어요."}</Text>
          </Pressable>
        ))}
      </PageScroll>
      <BottomTabs />
    </Page>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 10 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingVertical: 14 },
  name: { ...typography.title, marginTop: 2 },
  menuButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: tokens.white, borderWidth: 1, borderColor: tokens.outline, alignItems: "center", justifyContent: "center" },
  menuText: { color: tokens.primary, fontWeight: "700", letterSpacing: 1 },
  loader: { marginBottom: 12 },
  checkBanner: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 18, backgroundColor: tokens.primary, marginBottom: 14, gap: 13 },
  bannerIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  bannerIconText: { color: tokens.white, fontSize: 22 },
  bannerTitle: { color: tokens.white, fontSize: 14, fontWeight: "700" },
  bannerBody: { color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 3 },
  bannerArrow: { color: tokens.white, fontSize: 28 },
  flex: { flex: 1 },
  sectionCard: { marginBottom: 14 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: tokens.text },
  sectionLink: { fontSize: 11, fontWeight: "600", color: tokens.primary },
  weekRow: { flexDirection: "row", gap: 5, marginTop: 13 },
  dayColumn: { flex: 1, alignItems: "center", gap: 4 },
  dayBox: { width: "100%", aspectRatio: 1, borderRadius: 9, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  dayEmotion: { color: tokens.text, fontSize: 9 },
  dayLabel: { color: tokens.textMuted, fontSize: 9 },
  chipTitle: { marginBottom: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickRow: { flexDirection: "row", gap: 12, marginBottom: 18 },
  quickCard: { flex: 1, minHeight: 126, borderRadius: 18, backgroundColor: tokens.white, borderWidth: 1, borderColor: tokens.outline, padding: 16 },
  quickTint: { backgroundColor: tokens.primaryLight },
  quickIcon: { fontSize: 25, marginBottom: 10 },
  quickTitle: { fontSize: 14, fontWeight: "700", color: tokens.text },
  quickBody: { fontSize: 11, color: tokens.textMuted, marginTop: 4 },
  empty: { alignItems: "center", marginTop: 12 },
  emptyLink: { color: tokens.primary, marginTop: 10, fontWeight: "600", fontSize: 13 },
  recordCard: { backgroundColor: tokens.white, borderRadius: 18, borderWidth: 1, borderColor: tokens.outline, padding: 15, marginTop: 10 },
  miniChips: { flexDirection: "row", gap: 4, transform: [{ scale: 0.85 }] },
  recordBody: { ...typography.body, color: tokens.textMuted, marginTop: 5 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] }
});
