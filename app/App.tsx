import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { initializeNativeAuthProviders } from "./src/auth/providers";
import { SessionProvider, useSession } from "./src/context/SessionContext";
import { AppProvider } from "./src/context/AppContext";
import { SplashScreen } from "./src/components/SplashScreen";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { ProfileSetupScreen } from "./src/screens/ProfileSetupScreen";
import { AppNavigator } from "./src/screens/native/AppNavigator";
import { tokens } from "./src/config/tokens";
import { GuestMigrationDialog } from "./src/components/GuestMigrationDialog";

export default function App() {
  useEffect(() => { void initializeNativeAuthProviders(); }, []);
  return <SessionProvider><AppRoot /></SessionProvider>;
}

function AppRoot() {
  const { isRestoring, session, profile, login } = useSession();
  const [showSplash, setShowSplash] = useState(true);
  const [guest, setGuest] = useState(false);

  useEffect(() => { const timer = setTimeout(() => setShowSplash(false), 1500); return () => clearTimeout(timer); }, []);
  const profileComplete = Boolean(profile?.gender && profile?.birthDate && profile.agreedToTerms);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.background} />
      {showSplash || isRestoring ? <SplashScreen /> : !session && !guest ? (
        <WelcomeScreen onLogin={login} onGuest={() => setGuest(true)} />
      ) : session && !profileComplete ? (
        <ProfileSetupScreen />
      ) : (
        <AppProvider key={session?.userId ?? "guest"} isGuest={guest && !session}>
          <AppNavigator onRequestLogin={() => setGuest(false)} />
          {session ? <GuestMigrationDialog /> : null}
        </AppProvider>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: tokens.background } });
