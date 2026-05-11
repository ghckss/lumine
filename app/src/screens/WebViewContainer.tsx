import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, AppState, AppStateStatus, Linking, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { WebView, WebViewMessageEvent, WebViewNavigation } from "react-native-webview";
import { BottomTabBar, TabKey } from "../components/BottomTabBar";
import { createAppToWebPayload, createBridgeResponsePayload, createInjectedBridgeScript } from "../bridge/app-to-web";
import { handleWebToAppBridge } from "../bridge/registry";
import type { NativeBridgeEnvelope } from "../bridge/types";
import { SupportFallback } from "../components/SupportFallback";
import { WEB_BASE_URL } from "../config/env";
import { tokens } from "../config/tokens";
import type { LoginSession } from "../types/session";

const tabRoutes: Record<TabKey, string> = {
  home: "/",
  history: "/journal/history"
};

function getActiveTab(pathname: string): TabKey {
  if (pathname.startsWith("/journal/history")) {
    return "history";
  }
  return "home";
}

type WebViewContainerProps = {
  session: LoginSession | null;
  onLogout: () => Promise<void>;
};

export function WebViewContainer({ session, onLogout }: WebViewContainerProps) {
  const webViewRef = useRef<WebView>(null);
  const pendingEventsRef = useRef<Array<{ command: string; params?: Record<string, unknown> }>>([]);
  const isWebReadyRef = useRef(false);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);
  const source = useMemo(() => ({ uri: WEB_BASE_URL }), []);
  const injectedJavaScriptBeforeContentLoaded = useMemo(
    () => createInjectedBridgeScript(session?.accessToken ?? null),
    [session?.accessToken]
  );

  const injectAppEvent = useCallback((command: string, params?: Record<string, unknown>) => {
    webViewRef.current?.injectJavaScript(createAppToWebPayload(command, params));
  }, []);

  const sendAppEvent = useCallback((command: string, params?: Record<string, unknown>) => {
    if (!isWebReadyRef.current || !webViewRef.current) {
      pendingEventsRef.current.push({ command, params });
      return;
    }

    injectAppEvent(command, params);
  }, [injectAppEvent]);

  const flushPendingEvents = useCallback(() => {
    if (!webViewRef.current || !isWebReadyRef.current || pendingEventsRef.current.length === 0) {
      return;
    }

    pendingEventsRef.current.forEach(({ command, params }) => {
      injectAppEvent(command, params);
    });
    pendingEventsRef.current = [];
  }, [injectAppEvent]);

  const navigateToTab = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    sendAppEvent("navigation.navigate", { href: tabRoutes[tab] });
  }, [sendAppEvent]);

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

      if (envelope.payload.command === "navigation.ready") {
        isWebReadyRef.current = true;
        setHasLoadError(false);
        setIsLoading(false);
        injectAppEvent("network.changed", { online: true });
        flushPendingEvents();
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
  }, [flushPendingEvents, injectAppEvent, onLogout]);

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
    pendingEventsRef.current = [];
    isWebReadyRef.current = false;
    setWebViewKey((prev) => prev + 1);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.webViewFrame}>
          {hasLoadError ? (
            <SupportFallback onRetry={reloadWebView} />
          ) : (
            <WebView
              key={webViewKey}
              ref={webViewRef}
              source={source}
              style={styles.webview}
              injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
              onMessage={handleMessage}
              onLoadEnd={() => {
                setHasLoadError(false);
              }}
              onNavigationStateChange={(navState) => {
                handleNavigationStateChange(navState);
                if (isWebReadyRef.current) {
                  setIsLoading(false);
                }
              }}
              onError={() => {
                isWebReadyRef.current = false;
                setIsLoading(false);
                setHasLoadError(true);
              }}
              originWhitelist={["http://*", "https://*"]}
              javaScriptEnabled
              sharedCookiesEnabled
              bounces={false}
              overScrollMode="never"
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
