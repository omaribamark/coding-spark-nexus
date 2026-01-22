import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

function RootLayoutNav() {
  const { isDark } = useTheme();

  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="get-started" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="verify-email" options={{ headerShown: false }} />
        <Stack.Screen name="two-factor-auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="submit-claim" options={{ headerShown: false }} />
        <Stack.Screen name="claim-details" options={{ headerShown: false }} />
        <Stack.Screen name="trending-claims" options={{ headerShown: false }} />
        <Stack.Screen name="blog-detail" options={{ headerShown: false }} />
        <Stack.Screen name="about-app" options={{ headerShown: false }} />
        <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
        <Stack.Screen name="admin-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="fact-checker-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
