import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, AppStateStatus, Linking, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { WebView, WebViewMessageEvent, WebViewNavigation } from "react-native-webview";
import { BottomTabBar, TabKey } from "../components/BottomTabBar";
import { createAppToWebPayload, createBridgeResponsePayload, injectedBridgeScript } from "../bridge/app-to-web";
import { handleWebToAppBridge } from "../bridge/registry";
import type { NativeBridgeEnvelope } from "../bridge/types";
import { MoreMenuModal } from "../components/MoreMenuModal";
import { NativeTopBar } from "../components/NativeTopBar";
import { SupportFallback } from "../components/SupportFallback";
import { WEB_BASE_URL } from "../config/env";
import { tokens } from "../config/tokens";
import { clearAllDeviceCache } from "../storage/device-cache";
import type { LoginSession, UserProfile } from "../types/session";

const tabRoutes: Record<TabKey, string> = {
  home: "/",
  history: "/journal/history",
  support: "/support"
};

const deviceCacheKeys = [
  "journal.history",
  "screening.history",
  "screening.latest",
  "sync.queue"
];

function getActiveTab(pathname: string): TabKey {
  if (pathname.startsWith("/journal/history")) {
    return "history";
  }
  if (pathname.startsWith("/support")) {
    return "support";
  }
  return "home";
}

type WebViewContainerProps = {
  session: LoginSession | null;
  profile: UserProfile | null;
  onLogout: () => Promise<void>;
  onRequireAuth: () => void;
};

export function WebViewContainer({ session, profile, onLogout, onRequireAuth }: WebViewContainerProps) {
  const webViewRef = useRef<WebView>(null);
  const pendingEventsRef = useRef<Array<{ command: string; params?: Record<string, unknown> }>>([]);
  const isWebReadyRef = useRef(false);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);
  const [isMoreVisible, setIsMoreVisible] = useState(false);
  const source = useMemo(() => ({ uri: WEB_BASE_URL }), []);
  const isGuest = !session;

  const sendAppEvent = useCallback((command: string, params?: Record<string, unknown>) => {
    if (!isWebReadyRef.current || !webViewRef.current) {
      pendingEventsRef.current.push({ command, params });
      return;
    }

    webViewRef.current.injectJavaScript(createAppToWebPayload(command, params));
  }, []);

  const flushPendingEvents = useCallback(() => {
    if (!webViewRef.current || !isWebReadyRef.current || pendingEventsRef.current.length === 0) {
      return;
    }

    pendingEventsRef.current.forEach(({ command, params }) => {
      webViewRef.current?.injectJavaScript(createAppToWebPayload(command, params));
    });
    pendingEventsRef.current = [];
  }, []);

  const bootstrapWeb = useCallback(() => {
    setHasLoadError(false);
    sendAppEvent("auth.bootstrap", isGuest
      ? {
          status: "guest",
          displayName: "손님으로 머무는 오늘"
        }
      : {
          status: "ok",
          provider: session.provider,
          displayName: profile?.displayName ?? session.displayName,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          userId: session.userId,
          profile: profile
            ? {
                gender: profile.gender,
                birthDate: profile.birthDate,
                agreedToTerms: profile.agreedToTerms
              }
            : null
        });
    sendAppEvent("network.changed", { online: true });
    flushPendingEvents();
  }, [flushPendingEvents, isGuest, profile, sendAppEvent, session]);

  const navigateToTab = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    webViewRef.current?.injectJavaScript(`window.location.href = '${WEB_BASE_URL}${tabRoutes[tab]}'; true;`);
  }, []);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    try {
      const url = new URL(navState.url);
      setActiveTab(getActiveTab(url.pathname));
    } catch {
      setActiveTab("home");
    }
  }, []);

  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    try {
      const envelope = JSON.parse(event.nativeEvent.data) as NativeBridgeEnvelope;
      if (envelope.type !== "webToApp") {
        return;
      }

      const response = await handleWebToAppBridge(envelope.payload);
      webViewRef.current?.injectJavaScript(createBridgeResponsePayload(response));

      if (envelope.payload.command === "auth.clearSecure" && response.ok) {
        setTimeout(() => {
          void onLogout();
        }, 0);
      }
    } catch {
      webViewRef.current?.injectJavaScript(
        createBridgeResponsePayload({
          requestId: `bridge-error:${Date.now()}`,
          ok: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Malformed bridge payload"
          }
        })
      );
    }
  }, [onLogout]);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      sendAppEvent("app.stateChanged", { state: nextAppState });
    },
    [sendAppEvent]
  );

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);
    const deepLinkSubscription = Linking.addEventListener("url", ({ url }) => {
      sendAppEvent("app.deepLink", { url });
    });

    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          sendAppEvent("app.deepLink", { url, initial: true });
        }
      })
      .catch(() => undefined);

    return () => {
      appStateSubscription.remove();
      deepLinkSubscription.remove();
    };
  }, [handleAppStateChange, sendAppEvent]);

  const reloadWebView = useCallback(() => {
    setHasLoadError(false);
    setIsLoading(true);
    isWebReadyRef.current = false;
    setWebViewKey((prev) => prev + 1);
  }, []);

  const handleClearDeviceData = useCallback(() => {
    Alert.alert("기기 저장 데이터 비우기", "이 기기에 저장된 기록과 대기 데이터를 지울까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "비우기",
        style: "destructive",
        onPress: () => {
          void clearAllDeviceCache(deviceCacheKeys).then(() => {
            setIsMoreVisible(false);
            reloadWebView();
          });
        }
      }
    ]);
  }, [reloadWebView]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <NativeTopBar
          displayName={isGuest ? "손님으로 머무는 오늘" : `${profile?.displayName ?? session?.displayName ?? "당신"}님, 오늘의 마음`}
          onMenuPress={() => setIsMoreVisible(true)}
        />

        <View style={styles.webViewFrame}>
          {hasLoadError ? (
            <SupportFallback onRetry={reloadWebView} />
          ) : (
            <WebView
              key={webViewKey}
              ref={webViewRef}
              source={source}
              style={styles.webview}
              injectedJavaScriptBeforeContentLoaded={injectedBridgeScript}
              onMessage={handleMessage}
              onLoadStart={() => {
                isWebReadyRef.current = false;
                setIsLoading(true);
              }}
              onLoadEnd={() => {
                isWebReadyRef.current = true;
                setIsLoading(false);
                bootstrapWeb();
              }}
              onNavigationStateChange={handleNavigationStateChange}
              onError={() => {
                isWebReadyRef.current = false;
                setIsLoading(false);
                setHasLoadError(true);
              }}
              originWhitelist={["http://*", "https://*"]}
              javaScriptEnabled
              sharedCookiesEnabled
            />
          )}

          {isLoading && !hasLoadError ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={tokens.primary} />
              <Text style={styles.loadingText}>Lumine를 준비하고 있어요.</Text>
            </View>
          ) : null}
        </View>

        <BottomTabBar activeTab={activeTab} onPress={navigateToTab} />

        <MoreMenuModal
          visible={isMoreVisible}
          isGuest={isGuest}
          onClose={() => setIsMoreVisible(false)}
          onConnectAccount={() => {
            setIsMoreVisible(false);
            if (isGuest) {
              onRequireAuth();
            }
          }}
          onClearDeviceData={handleClearDeviceData}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: tokens.background },
  container: { flex: 1, backgroundColor: tokens.background },
  webViewFrame: { flex: 1, overflow: "hidden", backgroundColor: tokens.background },
  webview: { flex: 1, backgroundColor: tokens.background },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: `${tokens.background}F2` },
  loadingText: { fontSize: 14, color: tokens.textMuted }
});
