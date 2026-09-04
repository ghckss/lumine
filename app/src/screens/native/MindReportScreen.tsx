import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card, EmotionChip, Page, PageScroll, PrimaryButton, TopBar, typography } from "../../components/NativeUI";
import { tokens } from "../../config/tokens";
import { useApp } from "../../context/AppContext";
import { buildMindReport, localIsoDate, type MindReportPeriod, type ReportDay } from "../../lib/mind-report";

export function MindReportScreen() {
  const { journalRecords, screeningResults, navigate } = useApp();
  const [period, setPeriod] = useState<MindReportPeriod>("week");
  const referenceDate = localIsoDate();
  const report = useMemo(() => buildMindReport({
    period,
    referenceDate,
    journals: journalRecords,
    screenings: screeningResults
  }), [journalRecords, period, referenceDate, screeningResults]);

  const recordedChange = report.recordedDayDifference === 0
    ? "이전 기간과 같은 만큼 기록했어요"
    : report.recordedDayDifference > 0
      ? `이전 기간보다 ${report.recordedDayDifference}일 더 기록했어요`
      : `이전 기간보다 ${Math.abs(report.recordedDayDifference)}일 적게 기록했어요`;

  return (
    <Page>
      <TopBar title="마음 리포트" />
      <PageScroll contentStyle={styles.content}>
        <View style={styles.segment} accessibilityRole="tablist">
          {(["week", "month"] as const).map((value) => {
            const selected = period === value;
            return (
              <Pressable
                key={value}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setPeriod(value)}
                style={[styles.segmentButton, selected && styles.segmentButtonActive]}
              >
                <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{value === "week" ? "주간" : "월간"}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.hero}>
          <Text style={typography.caption}>{rangeLabel(report.currentRange.start, report.fullPeriodEnd)}</Text>
          <Text style={[typography.title, styles.heroTitle]}>{period === "week" ? "이번 주 마음은 어땠나요?" : "이번 달 마음을 돌아봐요"}</Text>
          <Text style={styles.heroBody}>기록을 평가하지 않고, 반복해서 나타난 마음을 함께 살펴봤어요.</Text>
        </View>

        <Card style={styles.countCard}>
          <View>
            <Text style={styles.eyebrow}>기록한 일수</Text>
            <Text style={styles.count}><Text style={styles.countStrong}>{report.recordedDays}</Text>일 / {report.totalPeriodDays}일</Text>
            <Text style={typography.caption}>현재까지 {report.elapsedDays}일이 지났어요</Text>
          </View>
          <View style={styles.changeBadge}><Text style={styles.changeText}>{recordedChange}</Text></View>
        </Card>

        {!report.hasRecords ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>✍️</Text>
            <Text style={typography.section}>아직 이 기간의 기록이 없어요</Text>
            <Text style={[typography.muted, styles.centerText]}>한 단어의 감정부터 남기면 다음 리포트에서 마음의 흐름을 볼 수 있어요.</Text>
            <View style={styles.emptyAction}><PrimaryButton label="감정 기록 시작하기" onPress={() => navigate("diary")} /></View>
          </Card>
        ) : (
          <>
            <SectionTitle title="자주 느낀 감정" subtitle="이전 같은 기간과 비교했어요" />
            <Card>
              {report.topEmotions.map((item, index) => {
                const change = report.emotionChanges[index];
                return (
                  <View key={item.emotion} style={[styles.emotionRow, index > 0 && styles.divider]}>
                    <EmotionChip emotion={item.emotion} />
                    <Text style={styles.emotionCount}>{item.count}회</Text>
                    <Text style={[styles.emotionDelta, change.difference > 0 && styles.deltaUp]}>{deltaLabel(change.difference)}</Text>
                  </View>
                );
              })}
            </Card>

            <SectionTitle title="마음이 머문 날" subtitle="선택한 감정을 기준으로 살펴봤어요" />
            <View style={styles.dayColumns}>
              <DayGroup title="편안했던 날" icon="☀️" days={report.comfortableDays} onPress={(day) => openRecord(day.date)} />
              <DayGroup title="무거웠던 날" icon="☁️" days={report.heavyDays} onPress={(day) => openRecord(day.date)} />
            </View>
          </>
        )}

        <SectionTitle title="마음 확인의 변화" subtitle="점수 대신 흐름만 부드럽게 전해요" />
        <Card style={report.screeningTrend.kind === "safety" ? styles.safetyCard : undefined}>
          <Text style={styles.trendIcon}>{trendIcon(report.screeningTrend.kind)}</Text>
          <Text style={styles.trendText}>{report.screeningTrend.message}</Text>
          {report.screeningTrend.kind === "safety" ? (
            <Pressable accessibilityRole="button" onPress={() => navigate("safety-help")} style={styles.safetyLink}>
              <Text style={styles.safetyLinkText}>지금 도움 연결하기</Text><Text style={styles.safetyLinkText}>›</Text>
            </Pressable>
          ) : null}
        </Card>

        <SectionTitle title="다음 기간의 작은 행동" />
        <Card style={styles.actionCard}>
          <View style={styles.actionNumber}><Text style={styles.actionNumberText}>1</Text></View>
          <Text style={styles.actionText}>{report.smallAction}</Text>
        </Card>
      </PageScroll>
    </Page>
  );

  function openRecord(date: string) {
    const record = journalRecords.find((item) => item.date === date);
    if (record) navigate("record-detail", { recordId: record.id });
  }
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.sectionHeading}><Text style={typography.section}>{title}</Text>{subtitle ? <Text style={typography.caption}>{subtitle}</Text> : null}</View>;
}

function DayGroup({ title, icon, days, onPress }: { title: string; icon: string; days: ReportDay[]; onPress: (day: ReportDay) => void }) {
  return (
    <Card style={styles.dayGroup}>
      <Text style={styles.dayGroupIcon}>{icon}</Text><Text style={styles.dayGroupTitle}>{title}</Text>
      {days.length === 0 ? <Text style={typography.caption}>아직 뚜렷한 날이 없어요</Text> : days.map((day) => (
        <Pressable accessibilityRole="button" key={day.date} onPress={() => onPress(day)} style={styles.dayLink}>
          <View><Text style={styles.dayDate}>{shortDate(day.date)}</Text><Text style={styles.dayEmotion} numberOfLines={1}>{day.emotions.join(" · ")}</Text></View>
          <Text style={styles.dayArrow}>›</Text>
        </Pressable>
      ))}
    </Card>
  );
}

function rangeLabel(start: string, end: string) { return `${shortDate(start)} – ${shortDate(end)}`; }
function shortDate(value: string) { const [, month, day] = value.split("-").map(Number); return `${month}월 ${day}일`; }
function deltaLabel(value: number) { return value === 0 ? "같음" : value > 0 ? `+${value}회` : `${value}회`; }
function trendIcon(kind: string) { return kind === "lighter" ? "🌿" : kind === "heavier" ? "☁️" : kind === "safety" ? "💜" : "〰️"; }

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingBottom: 38 },
  segment: { flexDirection: "row", alignSelf: "center", backgroundColor: tokens.outline, borderRadius: 14, padding: 3, width: 210 },
  segmentButton: { flex: 1, minHeight: 42, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  segmentButtonActive: { backgroundColor: tokens.white },
  segmentText: { color: tokens.textMuted, fontSize: 13, fontWeight: "700" },
  segmentTextActive: { color: tokens.primaryDark },
  hero: { alignItems: "center", paddingVertical: 24 },
  heroTitle: { marginTop: 7, textAlign: "center" },
  heroBody: { ...typography.muted, textAlign: "center", marginTop: 8, maxWidth: 300 },
  countCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  eyebrow: { ...typography.caption, color: tokens.primaryDark, fontWeight: "700" },
  count: { color: tokens.textMuted, fontSize: 14, marginVertical: 3 },
  countStrong: { color: tokens.primary, fontFamily: "serif", fontSize: 30, fontWeight: "700" },
  changeBadge: { maxWidth: "47%", backgroundColor: tokens.primaryLight, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9 },
  changeText: { color: tokens.primaryDark, fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center" },
  sectionHeading: { marginTop: 24, marginBottom: 10, gap: 2 },
  emptyCard: { alignItems: "center", paddingVertical: 26 },
  emptyIcon: { fontSize: 27, marginBottom: 9 },
  centerText: { textAlign: "center", marginTop: 7 },
  emptyAction: { alignSelf: "stretch", marginTop: 18 },
  emotionRow: { flexDirection: "row", alignItems: "center", minHeight: 52, gap: 8 },
  divider: { borderTopWidth: 1, borderTopColor: tokens.outline },
  emotionCount: { marginLeft: "auto", color: tokens.text, fontSize: 13, fontWeight: "700" },
  emotionDelta: { width: 44, color: tokens.textMuted, fontSize: 11, textAlign: "right" },
  deltaUp: { color: tokens.primary },
  dayColumns: { flexDirection: "row", gap: 10 },
  dayGroup: { flex: 1, padding: 13 },
  dayGroupIcon: { fontSize: 21 },
  dayGroupTitle: { color: tokens.text, fontSize: 13, fontWeight: "700", marginTop: 5, marginBottom: 10 },
  dayLink: { minHeight: 50, borderTopWidth: 1, borderTopColor: tokens.outline, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  dayDate: { color: tokens.text, fontSize: 11, fontWeight: "700" },
  dayEmotion: { color: tokens.textMuted, fontSize: 9, marginTop: 2, maxWidth: 90 },
  dayArrow: { color: tokens.primary, fontSize: 20 },
  trendIcon: { fontSize: 24 },
  trendText: { ...typography.body, marginTop: 8 },
  safetyCard: { borderColor: tokens.primary, borderWidth: 2 },
  safetyLink: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 48, marginTop: 10, borderTopWidth: 1, borderTopColor: tokens.outline },
  safetyLinkText: { color: tokens.primary, fontSize: 13, fontWeight: "700" },
  actionCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: tokens.primaryLight },
  actionNumber: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: tokens.primary },
  actionNumberText: { color: tokens.white, fontSize: 14, fontWeight: "800" },
  actionText: { ...typography.body, flex: 1, color: tokens.primaryDark, fontWeight: "600" }
});
