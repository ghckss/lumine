import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { DataManagementScreen, MenuScreen } from "../../features/account";
import { useSession } from "../../features/auth";
import { HomeScreen } from "../../features/home";
import { DiaryScreen, RecordDetailScreen, RecordsScreen, useJournal } from "../../features/journal";
import { MindReportScreen } from "../../features/report";
import {
  CheckQuestionScreen,
  CheckResultScreen,
  CheckStartScreen,
  useScreening,
  type ScreeningQuestionnaire,
  type ScreeningResult
} from "../../features/screening";
import { LegalScreen, SafetyHelpScreen } from "../../features/support";
import { tokens } from "../../shared/theme/tokens";
import { AppRouteScope, useNavigation } from "./NavigationProvider";
import { BottomTabs, TopBar } from "./NavigationChrome";
import { STACK_TRANSITION_MS, visibleRouteStack } from "./navigation-state";
import {
  createHomeRouteActions,
  createMenuRouteActions,
  createReportRouteActions,
  deleteAccountAndClearContent,
  guestMigrationSyncBadge
} from "./route-composition";
import type { AppRoute } from "./routes";

export function AppNavigator({ onRequestLogin }: { onRequestLogin: () => void }) {
  const { stack, backTransitionKey, goBack, navigate, resetTo } = useNavigation();
  const journal = useJournal();
  const screening = useScreening();
  const session = useSession();
  const visibleRoutes = visibleRouteStack(stack);
  const isPageChange = stack.length === 1;

  return (
    <View style={styles.navigator}>
      {visibleRoutes.map((route, index) => {
        const isTop = index === visibleRoutes.length - 1;
        return (
          <NavigationLayer
            key={route.key}
            mode={isPageChange ? "page" : isTop ? "stack" : "background"}
            exiting={route.key === backTransitionKey}
            interactive={isTop}
          >
            <AppRouteScope route={route}>{renderScreen(route, onRequestLogin, {
              goBack,
              navigate,
              resetTo,
              stackDepth: stack.length,
              journal,
              screening,
              session
            })}</AppRouteScope>
          </NavigationLayer>
        );
      })}
      {journal.pendingJournalDeletion ? (
        <View style={styles.undoBar} accessibilityLiveRegion="polite">
          <Text style={styles.undoText}>기록을 삭제했어요.</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="기록 삭제 취소" onPress={() => void journal.undoJournalDelete()} style={styles.undoButton}>
            <Text style={styles.undoAction}>실행 취소</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

type RouteActions = {
  goBack: () => void;
  navigate: (page: AppRoute["page"], params?: AppRoute["params"]) => void;
  resetTo: (page: AppRoute["page"], params?: AppRoute["params"]) => void;
  stackDepth: number;
  journal: ReturnType<typeof useJournal>;
  screening: ReturnType<typeof useScreening>;
  session: ReturnType<typeof useSession>;
};

function renderScreen(route: AppRoute, onRequestLogin: () => void, actions: RouteActions) {
  const homeRouteActions = createHomeRouteActions(actions.navigate);
  const reportRouteActions = createReportRouteActions(actions.navigate);
  const menuRouteActions = createMenuRouteActions(actions.navigate);
  switch (route.page) {
    case "home": return (
      <HomeScreen
        journalRecords={actions.journal.journalRecords}
        screeningResults={actions.screening.screeningResults}
        isLoading={actions.journal.isJournalLoading || actions.screening.isScreeningLoading}
        isGuest={!actions.session.session}
        displayName={actions.session.session?.displayName}
        footer={<BottomTabs />}
        {...homeRouteActions}
      />
    );
    case "diary": return (
      <DiaryScreen
        renderHeader={(hasExistingRecord) => <TopBar title={hasExistingRecord ? "감정 일기 수정" : "감정 일기"} showMenu />}
        onOpenRecord={(recordId) => actions.navigate("record-detail", { recordId, backToHome: true })}
      />
    );
    case "records": return (
      <RecordsScreen
        header={<TopBar title="마음기록 전체보기" onBack={actions.stackDepth > 1 ? actions.goBack : () => actions.resetTo("home")} />}
        footer={<BottomTabs />}
        onOpenDiary={() => actions.navigate("diary")}
        onOpenRecord={(recordId) => actions.navigate("record-detail", { recordId })}
      />
    );
    case "record-detail": return (
      <RecordDetailScreen
        recordId={typeof route.params?.recordId === "string" ? route.params.recordId : undefined}
        renderHeader={(recordFound) => <TopBar title={recordFound ? undefined : "기록 상세"} showMenu onBack={route.params?.backToHome ? () => actions.resetTo("home") : undefined} />}
        onEdit={() => actions.navigate("diary")}
        onDeleted={() => actions.resetTo("records")}
      />
    );
    case "mind-report": return (
      <MindReportScreen
        journalRecords={actions.journal.journalRecords}
        screeningResults={actions.screening.screeningResults}
        header={<TopBar title="마음 리포트" />}
        {...reportRouteActions}
      />
    );
    case "check-start": return (
      <CheckStartScreen
        header={<TopBar showMenu />}
        onStart={() => actions.navigate("check-question", { index: 0, answers: {} })}
      />
    );
    case "check-question": return (
      <CheckQuestionScreen
        index={typeof route.params?.index === "number" ? route.params.index : 0}
        previousAnswers={(route.params?.answers as Record<string, string> | undefined) ?? {}}
        initialQuestionnaire={route.params?.questionnaire as ScreeningQuestionnaire | undefined}
        header={<TopBar showMenu onBack={actions.goBack} />}
        onNext={(progress) => actions.navigate("check-question", progress)}
        onComplete={(result) => actions.navigate(result.requiresSafetyPrompt ? "safety-result" : "check-result", { result })}
      />
    );
    case "check-result": return renderScreeningResult(false, route.params?.result as ScreeningResult | undefined, actions);
    case "safety-result": return renderScreeningResult(true, route.params?.result as ScreeningResult | undefined, actions);
    case "safety-help": return <SafetyHelpScreen header={<TopBar title="도움 요청" showMenu />} onOpenDiary={() => actions.navigate("diary")} />;
    case "menu": return (
      <MenuScreen
        isGuest={!actions.session.session}
        displayName={actions.session.session?.displayName}
        journalCount={actions.journal.journalRecords.length}
        screeningCount={actions.screening.screeningResults.length}
        syncBadge={guestMigrationSyncBadge(actions.session.guestMigration)}
        header={<TopBar title="메뉴" />}
        onRequestLogin={onRequestLogin}
        onRequestGuestMigration={() => void actions.session.requestGuestMigration()}
        {...menuRouteActions}
        onLogout={() => void actions.session.logout()}
      />
    );
    case "data-management": return (
      <DataManagementScreen
        header={<TopBar title="내 데이터 관리" />}
        onDeleteAccount={() => deleteAccountAndClearContent({
          deleteAccount: actions.session.deleteAccount,
          clearJournalContent: actions.journal.clearJournalContent,
          clearScreeningContent: actions.screening.clearScreeningContent
        })}
      />
    );
    case "terms": return <LegalScreen type="terms" header={<TopBar title="이용약관" />} />;
    case "privacy": return <LegalScreen type="privacy" header={<TopBar title="개인정보처리방침" />} />;
    default: return null;
  }
}

function renderScreeningResult(safety: boolean, result: ScreeningResult | undefined, actions: RouteActions) {
  const header = result
    ? <TopBar title={safety ? "마음이 걱정돼요" : "마음 상태 결과"} showBack={false} showMenu />
    : <TopBar title="마음 상태 결과" />;
  return (
    <CheckResultScreen
      result={result}
      safety={safety}
      header={header}
      onShowGeneralResult={(screeningResult) => actions.navigate("check-result", { result: screeningResult })}
      onRequestSafetyHelp={() => actions.navigate("safety-help")}
      onWriteJournal={() => actions.navigate("diary")}
      onHome={() => actions.resetTo("home")}
    />
  );
}

function NavigationLayer({ children, mode, exiting, interactive }: { children: React.ReactNode; mode: "page" | "stack" | "background"; exiting: boolean; interactive: boolean }) {
  const progress = useRef(new Animated.Value(mode === "background" ? 1 : 0)).current;
  const distance = mode === "stack" ? Dimensions.get("window").width : 18;
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });
  const opacity = mode === "page" ? progress : 1;

  useEffect(() => {
    if (mode === "background") return;
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: mode === "stack" ? STACK_TRANSITION_MS : 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    });
    animation.start();
    return () => animation.stop();
  }, [mode, progress]);

  useEffect(() => {
    if (!exiting) return;
    Animated.timing(progress, {
      toValue: 0,
      duration: STACK_TRANSITION_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true
    }).start();
  }, [exiting, progress]);

  return (
    <Animated.View
      pointerEvents={interactive ? "auto" : "none"}
      style={[styles.layer, mode === "stack" && styles.stackedLayer, { opacity, transform: [{ translateX }] }]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  navigator: { flex: 1, overflow: "hidden", backgroundColor: tokens.background },
  layer: { ...StyleSheet.absoluteFillObject, backgroundColor: tokens.background },
  stackedLayer: {
    shadowColor: "#24183A",
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 12
  },
  undoBar: { position: "absolute", left: 16, right: 16, bottom: 16, zIndex: 30, elevation: 30, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: tokens.primaryDark, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13 },
  undoText: { color: tokens.white, fontSize: 13 },
  undoButton: { minWidth: 72, minHeight: 44, alignItems: "center", justifyContent: "center" },
  undoAction: { color: tokens.white, fontSize: 13, fontWeight: "800", padding: 4 }
});
