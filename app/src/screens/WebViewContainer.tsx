import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export function WebViewContainer() {
  return (
    <View style={styles.container}>
      <WebView source={{ uri: "http://localhost:3000" }} style={styles.webview} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  webview: {
    flex: 1
  }
});
