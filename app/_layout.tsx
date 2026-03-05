import { ToastProvider, useToast } from "@/components/ToastProvider";
import "@/global.css";
import { requestPermissions } from "@/src/lib/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Alert, Linking } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider>
        <NotificationInitializer />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-task"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="edit-task"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
        </Stack>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}

function NotificationInitializer() {
  const { showToast } = useToast();

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched");
        if (!hasLaunched) {
          await AsyncStorage.setItem("hasLaunched", "true");

          Alert.alert(
            "Welcome to SateSync",
            "This app can send you timely reminders for your tasks.\n\n" +
              "We’ll ask for permission to show notifications — you can always change this in Settings.",
            [{ text: "Continue", style: "default" }],
          );
        }

        const status = await requestPermissions();

        if (status === "granted") {
          showToast({
            message: "Notifications enabled – you'll get timely reminders",
            type: "success",
            duration: 3000,
          });
        } else {
          showToast({
            message:
              "Reminders disabled – enable in Settings for notifications",
            type: "error",
            duration: 5000,
          });

          const hasSeenDenial = await AsyncStorage.getItem(
            "hasSeenNotificationDenial",
          );
          if (!hasSeenDenial) {
            await AsyncStorage.setItem("hasSeenNotificationDenial", "true");

            Alert.alert(
              "Reminders Disabled",
              "You won’t receive notifications when tasks are due.\n\n" +
                "To enable reminders, go to Settings → Notifications → SateSync and allow notifications.",
              [
                { text: "Not Now", style: "cancel" },
                {
                  text: "Open Settings",
                  onPress: () => Linking.openSettings(),
                },
              ],
            );
          }
        }
      } catch (error) {
        console.error("[Notifications] Setup failed", error);
        showToast({
          message: "Failed to initialize notifications",
          type: "error",
          duration: 4000,
        });
      }
    };

    setupNotifications();
  }, []);

  return null;
}
