import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Slot, useSegments, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useAuthStore, selectStatus } from "@/stores/auth";
import { colors } from "@/constants/theme";

export default function RootLayout() {
  const status = useAuthStore(selectStatus);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    const currentGroup = segments[0];

    if (status === "unauthenticated" && currentGroup !== "(auth)") {
      router.replace("/(auth)/login");
    } else if (
      (status === "unregistered" || status === "error") &&
      currentGroup !== "(onboarding)"
    ) {
      router.replace("/(onboarding)/user-register");
    } else if (status === "authenticated" && currentGroup !== "(app)") {
      router.replace("/(app)/(tabs)/workspace");
    }
  }, [status, segments, router]);

  if (status === "loading") {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <BottomSheetModalProvider>
          <Slot />
        </BottomSheetModalProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
