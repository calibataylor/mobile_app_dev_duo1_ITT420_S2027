import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '@/src/constants/theme';
import { useSettings } from '@/src/context/SettingsContext';
import ThemedText from '@/src/components/ThemedText';
import Button from '@/src/components/Button';

export default function WebViewScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highContrast } = useSettings();
  const webViewRef = useRef<WebView>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  const handleOpenExternal = () => {
    if (url) Linking.openURL(url);
  };

  const handleRefresh = () => {
    setError(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  const handleGoBack = () => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    }
  };

  if (!url) {
    return (
      <View style={[styles.errorContainer, highContrast && styles.highContrastBg]}>
        <Ionicons name="alert-circle" size={64} color={COLORS.error} />
        <ThemedText variant="subtitle" style={styles.errorText}>
          No URL provided
        </ThemedText>
        <Button title="Go Back" onPress={() => router.back()} icon="arrow-back" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, highContrast && styles.highContrastBg]}>
        <Ionicons name="cloud-offline" size={64} color={COLORS.error} />
        <ThemedText variant="subtitle" style={styles.errorText}>
          Unable to load page
        </ThemedText>
        <ThemedText variant="body" color={COLORS.textSecondary} style={styles.errorSubtext}>
          The page might be unavailable or require internet connection
        </ThemedText>
        <View style={styles.errorActions}>
          <Button title="Try Again" onPress={handleRefresh} icon="refresh" />
          <Button
            title="Open Externally"
            onPress={handleOpenExternal}
            icon="open-outline"
            variant="outline"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, highContrast && styles.highContrastBg]}>
      {/* Toolbar */}
      <View style={[styles.toolbar, highContrast && styles.highContrastToolbar]}>
        <TouchableOpacity
          style={[styles.toolbarButton, !canGoBack && styles.disabledButton]}
          onPress={handleGoBack}
          disabled={!canGoBack}
          accessibilityLabel="Go back in browser"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={canGoBack ? (highContrast ? COLORS.highContrastText : COLORS.textPrimary) : COLORS.textLight}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={handleRefresh}
          accessibilityLabel="Refresh page"
        >
          <Ionicons
            name="refresh"
            size={24}
            color={highContrast ? COLORS.highContrastText : COLORS.textPrimary}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={handleOpenExternal}
          accessibilityLabel="Open in browser"
        >
          <Ionicons
            name="open-outline"
            size={24}
            color={highContrast ? COLORS.highContrastText : COLORS.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setError(true)}
        onNavigationStateChange={(state) => setCanGoBack(state.canGoBack)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.navy} />
            <ThemedText variant="body" style={styles.loadingText}>
              Loading...
            </ThemedText>
          </View>
        )}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={COLORS.gold} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  highContrastBg: {
    backgroundColor: COLORS.highContrastBg,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  highContrastToolbar: {
    backgroundColor: COLORS.highContrastBg,
    borderBottomColor: COLORS.highContrastAccent,
  },
  toolbarButton: {
    padding: SPACING.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: SPACING.md,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: SPACING.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  errorText: {
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: SPACING.sm,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  errorActions: {
    gap: SPACING.md,
  },
});
