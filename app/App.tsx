import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { WebViewContainer } from "@/src/screens/WebViewContainer";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <WebViewContainer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5efe6"
  }
});
