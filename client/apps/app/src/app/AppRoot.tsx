import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { GuestMigrationDialog, ProfileSetupScreen, useSession, WelcomeScreen } from "../features/auth";
import { JournalProvider } from "../features/journal";
import { ScreeningProvider } from "../features/screening";
import { SplashScreen } from "../shared/ui";
import { tokens } from "../shared/theme/tokens";
import { initializeAuth } from "./bootstrap/initialize-auth";
import { AppNavigator, NavigationProvider, useNavigation } from "./navigation";
import { AppProviders } from "./providers/AppProviders";

export function AppRoot() {
  useEffect(() => { void initializeAuth(); }, []);
  return <AppProviders><AppGate /></AppProviders>;
}

function AppGate() {
  const { isRestoring, session, profile, login } = useSession();
  const [showSplash, setShowSplash] = useState(true);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const profileComplete = Boolean(profile?.gender && profile?.birthDate && profile.agreedToTerms);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.background} />
      {showSplash || isRestoring ? <SplashScreen /> : !session && !guest ? (
        <WelcomeScreen onLogin={login} onGuest={() => setGuest(true)} />
      ) : session && !profileComplete ? (
        <ProfileSetupScreen />
      ) : (
        <JournalProvider key={session?.userId ?? "guest"}>
          <ScreeningProvider>
            <NavigationProvider>
              <AppExperience showGuestMigration={Boolean(session)} onRequestLogin={() => setGuest(false)} />
            </NavigationProvider>
          </ScreeningProvider>
        </JournalProvider>
      )}
    </SafeAreaView>
  );
}

function AppExperience({ showGuestMigration, onRequestLogin }: { showGuestMigration: boolean; onRequestLogin: () => void }) {
  const { navigate } = useNavigation();

  return (
    <>
      <AppNavigator onRequestLogin={onRequestLogin} />
      {showGuestMigration ? <GuestMigrationDialog onRequestSafetyHelp={() => navigate("safety-help")} /> : null}
    </>
  );
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: tokens.background } });
