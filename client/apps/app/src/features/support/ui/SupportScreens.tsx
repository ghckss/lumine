import React from "react";
import { Linking, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { tokens } from "../../../shared/theme/tokens";
import { Card, Page, PageScroll, PrimaryButton, typography } from "../../../shared/ui";

const helpMessage = "안녕하세요. 저 지금 많이 힘들어요. 잠깐 이야기 나눠줄 수 있나요? 당신이 필요해요.";

export function SafetyHelpScreen({ header, onOpenDiary }: { header: React.ReactNode; onOpenDiary: () => void }) {
  return (
    <Page>
      {header}
      <PageScroll>
        <View style={styles.helpHero}><View style={styles.helpMark}><Text style={styles.helpMarkText}>🤝</Text></View><Text style={typography.title}>도움을 요청해요</Text><Text style={[typography.muted, styles.center]}>혼자 버티지 않아도 돼요. 언제든 도움을 요청할 수 있어요.</Text></View>
        <Text style={[typography.section, styles.sectionTitle]}>긴급 연락처</Text>
        {[{ icon: "☎", title: "자살예방상담전화", phone: "109", detail: "24시간 무료 · 비밀보장", color: tokens.danger }, { icon: "🚑", title: "응급전화", phone: "119", detail: "즉각 대응 · 24시간", color: tokens.accent }, { icon: "🏥", title: "보건복지상담센터", phone: "129", detail: "정신건강 상담 · 24시간", color: tokens.safe }].map((item) => (
          <Pressable key={item.phone} onPress={() => void Linking.openURL(`tel:${item.phone}`)} style={({ pressed }) => [styles.contactCard, item.phone === "109" && { borderWidth: 2, borderColor: tokens.danger }, pressed && styles.pressed]}>
            <View style={[styles.contactIcon, { backgroundColor: `${item.color}20` }]}><Text style={styles.contactEmoji}>{item.icon}</Text></View>
            <View style={styles.flex}><Text style={styles.contactTitle}>{item.title}</Text><Text style={[styles.contactPhone, { color: item.color }]}>{item.phone}</Text><Text style={typography.caption}>{item.detail}</Text></View>
            <View style={[styles.callBadge, { backgroundColor: `${item.color}18` }]}><Text style={[styles.callText, { color: item.color }]}>전화</Text></View>
          </Pressable>
        ))}
        <Text style={[typography.section, styles.shareTitle]}>주변 사람에게 도움 요청하기</Text>
        <Card><View style={styles.messageBox}><Text style={styles.messageText}>“{helpMessage}”</Text></View><PrimaryButton label="메시지 공유하기" onPress={() => void Share.share({ message: helpMessage })} /></Card>
        <Pressable onPress={onOpenDiary} style={({ pressed }) => [styles.diaryLink, pressed && styles.pressed]}><Text style={styles.diaryIcon}>✍️</Text><View style={styles.flex}><Text style={styles.diaryTitle}>감정 일기로 마음 털어놓기</Text><Text style={typography.caption}>지금의 감정을 기록해보세요</Text></View><Text style={styles.arrow}>›</Text></Pressable>
      </PageScroll>
    </Page>
  );
}

const terms = [
  ["제1조 (목적)", "이 약관은 Lumine 서비스를 이용하는 데 필요한 권리, 의무 및 책임사항을 규정함을 목적으로 합니다."],
  ["제2조 (서비스)", "서비스는 마음 상태 확인, 감정 일기, 안전 도움 연결 등의 기능을 제공합니다."],
  ["제3조 (서비스 이용)", "서비스는 마음 건강을 지원하기 위한 도구이며 전문 의료 서비스를 대체하지 않습니다. 심각한 증상이 있을 경우 전문 의료기관을 방문하시기 바랍니다."],
  ["제4조 (서비스 변경 및 중단)", "기술적 또는 운영상 필요에 따라 서비스를 변경하거나 일시 중단할 수 있으며 중요한 변경 사항은 사전에 안내합니다."],
  ["제5조 (면책)", "마음 상태 확인 결과의 정확성을 보증하지 않으며 참고 목적으로만 활용해야 합니다."]
];

const privacy = [
  ["수집하는 개인정보", "성별 및 생년월일, 감정 일기 기록, 마음 상태 확인 응답, 서비스 이용 로그를 수집할 수 있습니다."],
  ["이용 목적", "서비스 제공과 개선, 맞춤형 위로 메시지 및 감정 흐름 분석 기능 제공에 사용합니다."],
  ["보관 기간", "이용자가 탈퇴하거나 데이터 삭제를 요청할 때까지 보관하며 삭제 요청 시 관련 법령에 따른 정보를 제외하고 파기합니다."],
  ["데이터 보안", "데이터는 안전한 연결을 통해 전송되며 접근 권한을 최소화하여 관리합니다."],
  ["이용자의 권리", "본인의 개인정보에 대한 열람, 수정 및 삭제를 요청할 수 있습니다."],
  ["문의", "개인정보 관련 문의는 서비스 고객지원 채널을 통해 접수할 수 있습니다."]
];

export function LegalScreen({ type, header }: { type: "terms" | "privacy"; header: React.ReactNode }) {
  const sections = type === "terms" ? terms : privacy;
  return <Page>{header}<PageScroll><Text style={[typography.caption, styles.legalDate]}>{type === "terms" ? "시행일" : "최종 업데이트"}: 2026년 9월 1일</Text>{sections.map(([title, body]) => <View key={title} style={styles.legalSection}><Text style={typography.section}>{title}</Text><Text style={[typography.muted, styles.legalBody]}>{body}</Text></View>)}</PageScroll></Page>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  helpHero: { alignItems: "center", paddingVertical: 18, gap: 8 },
  helpMark: { width: 66, height: 66, borderRadius: 33, backgroundColor: tokens.dangerLight, alignItems: "center", justifyContent: "center", marginBottom: 3 },
  helpMarkText: { fontSize: 31 },
  center: { textAlign: "center" },
  sectionTitle: { marginTop: 8, marginBottom: 11 },
  contactCard: { flexDirection: "row", alignItems: "center", gap: 13, borderRadius: 18, borderWidth: 1, borderColor: tokens.outline, backgroundColor: tokens.white, padding: 15, marginBottom: 10 },
  contactIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  contactEmoji: { fontSize: 22 },
  contactTitle: { color: tokens.text, fontSize: 13, fontWeight: "700" },
  contactPhone: { fontFamily: "serif", fontSize: 25, fontWeight: "700" },
  callBadge: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 9 },
  callText: { fontSize: 12, fontWeight: "700" },
  shareTitle: { marginTop: 15, marginBottom: 11 },
  messageBox: { borderRadius: 12, backgroundColor: tokens.surfaceMuted, padding: 14, marginBottom: 12 },
  messageText: { ...typography.muted, fontStyle: "italic" },
  diaryLink: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: tokens.primaryLight, borderWidth: 1, borderColor: tokens.outline, borderRadius: 18, padding: 15, marginTop: 16 },
  diaryIcon: { fontSize: 20 },
  diaryTitle: { color: tokens.primaryDark, fontSize: 13, fontWeight: "700" },
  arrow: { color: tokens.outline, fontSize: 25 },
  legalDate: { marginTop: 5, marginBottom: 22 },
  legalSection: { marginBottom: 20 },
  legalBody: { marginTop: 6 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] }
});
