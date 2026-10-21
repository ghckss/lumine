import React from "react";
import { Text, View } from "react-native";
import { Card, Logo, Page, PageScroll, PrimaryButton, typography } from "../../../shared/ui";
import { screeningScreenStyles as styles } from "./screening-screen-styles";

export function CheckStartScreen({ header, onStart }: { header?: React.ReactNode; onStart: () => void }) {
  return (
    <Page>
      {header}
      <PageScroll>
        <View style={styles.hero}><Logo size={96} /><Text style={[typography.hero, styles.heroTitle]}>마음 상태 확인</Text><Text style={styles.heroBody}>지금 내 마음이 어떤지 부드럽게 살펴볼게요.{"\n"}솔직하게 답해주실수록 더 알맞은 결과를 드릴 수 있어요.</Text></View>
        <View style={styles.infoRow}>
          {[{ icon: "⏱️", title: "약 5분", body: "소요 시간" }, { icon: "🔒", title: "비공개", body: "개인정보 보호" }, { icon: "📊", title: "11가지", body: "질문 항목" }].map((item) => (
            <Card key={item.title} style={styles.infoCard}><Text style={styles.infoIcon}>{item.icon}</Text><Text style={styles.infoTitle}>{item.title}</Text><Text style={typography.caption}>{item.body}</Text></Card>
          ))}
        </View>
        <View style={styles.notice}><Text style={styles.noticeTitle}>안내사항</Text>{["지난 2주간을 기준으로 답변해주세요", "결과는 점수나 진단명 없이 친절하게 전달돼요", "다음 확인은 4주 후에 권장해요", "이 확인은 전문적인 진단을 대체하지 않아요"].map((line) => <Text key={line} style={styles.noticeLine}>•  {line}</Text>)}</View>
      </PageScroll>
      <View style={styles.bottom}><PrimaryButton label="시작하기" onPress={onStart} /></View>
    </Page>
  );
}
