import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { tokens } from "../../../shared/theme/tokens";
import { Card, Logo, Page, PageScroll, PrimaryButton, typography } from "../../../shared/ui";
import type { ScreeningResult } from "../model/screening";
import { screeningScreenStyles as styles } from "./screening-screen-styles";

type Props = {
  result?: ScreeningResult;
  safety?: boolean;
  header?: React.ReactNode;
  onShowGeneralResult: (result: ScreeningResult) => void;
  onRequestSafetyHelp: () => void;
  onWriteJournal: () => void;
  onHome: () => void;
};

export function CheckResultScreen({ result, safety = false, header, onShowGeneralResult, onRequestSafetyHelp, onWriteJournal, onHome }: Props) {
  if (!result) return <Page>{header}<View style={styles.hero}><ActivityIndicator color={tokens.primary} /></View></Page>;

  return (
    <Page>
      {header}
      <PageScroll>
        <View style={styles.resultHero}>
          {safety ? <View style={styles.warningMark}><Text style={styles.warningText}>!</Text></View> : <Logo size={80} />}
          <Text style={[typography.title, styles.resultTitle]}>{safety ? "지금 많이 힘드신 것 같아요" : result.publicSummary}</Text>
          {safety ? <Text style={styles.heroBody}>당신의 마음이 걱정돼요. 혼자 버티려 하지 않아도 돼요.{"\n"}도움을 요청하는 것은 용기 있는 일이에요.</Text> : null}
        </View>
        <Card style={styles.comfortCard}><Text style={styles.heart}>💜</Text><Text style={styles.comfortText}>{result.publicComfortMessage}</Text></Card>
        {safety ? <EmergencyCards /> : <><Text style={[typography.section, styles.recommendTitle]}>추천 행동</Text>{result.recommendedActions.map((action, index) => <Card key={action} style={styles.recommendCard}><View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View><Text style={styles.recommendText}>{action}</Text></Card>)}<View style={styles.rescreen}><Text style={styles.rescreenTitle}>◷  다음 확인 권장일</Text><Text style={typography.muted}>{new Date(result.recommendedRescreenAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</Text></View></>}
        {safety ? <Pressable onPress={() => onShowGeneralResult(result)} style={styles.generalResult}><Text style={typography.muted}>일반 결과도 확인하기</Text><Text style={styles.helpArrow}>›</Text></Pressable> : null}
        <Pressable onPress={onRequestSafetyHelp} style={styles.helpLink}><Text style={styles.helpIcon}>🆘</Text><View style={{ flex: 1 }}><Text style={styles.helpTitle}>도움이 필요하다면</Text><Text style={styles.helpBody}>전문 상담 연결하기</Text></View><Text style={styles.helpArrow}>›</Text></Pressable>
      </PageScroll>
      <View style={styles.resultActions}><View style={{ flex: 1 }}><PrimaryButton variant="outline" label="감정 일기 쓰기" onPress={onWriteJournal} /></View><View style={{ flex: 1 }}><PrimaryButton label="홈으로" onPress={onHome} /></View></View>
    </Page>
  );
}

function EmergencyCards() {
  return <View style={styles.emergencyWrap}><Text style={[typography.section, styles.recommendTitle]}>지금 바로 연결할 수 있어요</Text>{[["자살예방상담전화", "109", "24시간 무료 · 비밀보장"], ["응급전화", "119", "즉각 대응 · 24시간"]].map(([title, phone, body]) => <Card key={phone} style={[styles.emergencyCard, phone === "109" && { borderWidth: 2, borderColor: tokens.danger }]}><View style={[styles.phoneIcon, { backgroundColor: phone === "109" ? tokens.danger : tokens.accent }]}><Text style={styles.phoneIconText}>☎</Text></View><View style={{ flex: 1 }}><Text style={styles.emergencyTitle}>{title}</Text><Text style={[styles.phone, { color: phone === "109" ? tokens.danger : tokens.accent }]}>{phone}</Text><Text style={typography.caption}>{body}</Text></View></Card>)}</View>;
}
