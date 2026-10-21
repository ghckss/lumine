import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Card, Logo, Page, PageScroll, PrimaryButton, typography } from "../../../shared/ui";
import { useJournal } from "../model/JournalProvider";
import { EmotionChip } from "./EmotionChip";
import { localIsoDay, styles, syncLabel } from "./journal-screen-ui";

export function RecordDetailScreen({ recordId, renderHeader, onEdit, onDeleted }: {
  recordId?: string;
  renderHeader: (recordFound: boolean) => React.ReactNode;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const { journalRecords, retryJournal, deleteJournal } = useJournal();
  const [actionError, setActionError] = useState<string | null>(null);
  const record = journalRecords.find((item) => item.id === recordId);
  if (!record) return <Page>{renderHeader(false)}<View style={styles.empty}><Text style={styles.emptyEmoji}>📭</Text><Text style={typography.muted}>기록을 찾을 수 없어요</Text></View></Page>;

  return (
    <Page>
      {renderHeader(true)}
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
        {record.date === localIsoDay() ? <View style={styles.editButton}><PrimaryButton variant="outline" label="오늘 기록 수정하기" onPress={onEdit} /></View> : null}
        <View style={styles.deleteButton}><PrimaryButton variant="danger" label="기록 삭제" onPress={() => {
          void deleteJournal(record).then(onDeleted).catch((error) => setActionError(error instanceof Error ? error.message : "삭제하지 못했어요."));
        }} /></View>
      </PageScroll>
    </Page>
  );
}
