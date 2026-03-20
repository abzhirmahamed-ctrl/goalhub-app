import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts,
} from "@expo-google-fonts/inter";
import {
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts as usePoppinsFonts,
} from "@expo-google-fonts/poppins";
import {
  Rajdhani_600SemiBold,
  Rajdhani_700Bold,
  useFonts as useRajdhaniFonts,
} from "@expo-google-fonts/rajdhani";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SplashAnimation } from "@/components/SplashAnimation";
import { LanguageProvider } from "@/context/LanguageContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 500,
      staleTime: 30_000,
      gcTime: 60_000,
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="match/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="admin"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [interLoaded, interError] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [poppinsLoaded, poppinsError] = usePoppinsFonts({
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [rajdhaniLoaded, rajdhaniError] = useRajdhaniFonts({
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
  });

  const fontsSettled =
    (interLoaded || !!interError) &&
    (poppinsLoaded || !!poppinsError) &&
    (rajdhaniLoaded || !!rajdhaniError);

  const ready = fontsSettled || timedOut;

  // Fallback: if fonts haven't loaded after 8 seconds, proceed anyway
  useEffect(() => {
    timeoutRef.current = setTimeout(() => setTimedOut(true), 8000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (ready) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#020617" }}>
            <KeyboardProvider>
              <LanguageProvider>
                <RootLayoutNav />
                {showSplash && (
                  <SplashAnimation onDone={() => setShowSplash(false)} />
                )}
              </LanguageProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
