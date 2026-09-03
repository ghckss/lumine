import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { AppRouteScope, STACK_TRANSITION_MS, useApp } from "../../context/AppContext";
import { tokens } from "../../config/tokens";
import type { AppRoute } from "../../types/content";
import { HomeScreen } from "./HomeScreen";
import { DiaryScreen, RecordDetailScreen, RecordsScreen } from "./JournalScreens";
import { CheckQuestionScreen, CheckResultScreen, CheckStartScreen } from "./ScreeningScreens";
import { DataManagementScreen, LegalScreen, MenuScreen, SafetyHelpScreen } from "./SupportAndSettingsScreens";

export function AppNavigator({ onRequestLogin }: { onRequestLogin: () => void }) {
  const { stack, backTransitionKey, pendingJournalDeletion, undoJournalDelete } = useApp();
  const visibleRoutes = stack.slice(-2);
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
            <AppRouteScope route={route}>{renderScreen(route, onRequestLogin)}</AppRouteScope>
          </NavigationLayer>
        );
      })}
      {pendingJournalDeletion ? (
        <View style={styles.undoBar} accessibilityLiveRegion="polite">
          <Text style={styles.undoText}>기록을 삭제했어요.</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="기록 삭제 취소" onPress={() => void undoJournalDelete()} style={styles.undoButton}>
            <Text style={styles.undoAction}>실행 취소</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function renderScreen(route: AppRoute, onRequestLogin: () => void) {
  switch (route.page) {
    case "home": return <HomeScreen />;
    case "diary": return <DiaryScreen />;
    case "records": return <RecordsScreen />;
    case "record-detail": return <RecordDetailScreen />;
    case "check-start": return <CheckStartScreen />;
    case "check-question": return <CheckQuestionScreen />;
    case "check-result": return <CheckResultScreen />;
    case "safety-result": return <CheckResultScreen safety />;
    case "safety-help": return <SafetyHelpScreen />;
    case "menu": return <MenuScreen onRequestLogin={onRequestLogin} />;
    case "data-management": return <DataManagementScreen />;
    case "terms": return <LegalScreen type="terms" />;
    case "privacy": return <LegalScreen type="privacy" />;
    default: return <HomeScreen />;
  }
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
