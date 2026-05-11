import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { initializeNativeAuthProviders } from "./src/auth/providers";
import { SessionProvider, useSession } from "./src/context/SessionContext";
import { SplashScreen } from "./src/components/SplashScreen";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { NativeAuthScreen } from "./src/screens/NativeAuthScreen";
import { ProfileSetupScreen } from "./src/screens/ProfileSetupScreen";
import { WebViewContainer } from "./src/screens/WebViewContainer";
import { tokens } from "./src/config/tokens";

export default function App() {
  useEffect(() => {
    void initializeNativeAuthProviders();
  }, []);

  return (
    <SessionProvider>
      <AppRoot />
    </SessionProvider>
  );
}

function AppRoot() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const { isRestoring, session, profile, logout } = useSession();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  if (isSplashVisible || isRestoring) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={tokens.background} />
        <SplashScreen />
      </SafeAreaView>
    );
  }

  const isProfileComplete = Boolean(profile?.gender && profile?.birthDate && profile.agreedToTerms);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={tokens.background} />
        {isGuestMode ? (
          <WebViewContainer
            session={null}
            onLogout={logout}
          />
        ) : hasSeenWelcome ? (
          <NativeAuthScreen onBack={() => setHasSeenWelcome(false)} />
        ) : (
          <WelcomeScreen
            onStart={() => setHasSeenWelcome(true)}
            onExistingAccount={() => setHasSeenWelcome(true)}
            onGuest={() => {
              setIsGuestMode(true);
            }}
          />
        )}
      </SafeAreaView>
    );
  }

  if (!isProfileComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={tokens.background} />
        <ProfileSetupScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.background} />
      <WebViewContainer session={session} onLogout={logout} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.background
  }
});
