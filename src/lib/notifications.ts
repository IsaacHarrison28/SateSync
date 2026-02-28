import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<
  "granted" | "denied" | "undetermined"
> {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === "android" && finalStatus === "granted") {
      await Notifications.setNotificationChannelAsync("task-reminders", {
        name: "Task Reminders",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#2563eb",
      });
    }

    return finalStatus;
  } catch (error) {
    console.error("Permission request failed:", error);
    return "denied";
  }
}

interface ScheduleResult {
  success: boolean;
  notificationId?: string;
  error?: string;
}

export async function scheduleTaskNotification(task: {
  id: string;
  title: string;
  description?: string;
  dateTime: string;
}): Promise<ScheduleResult> {
  const triggerDate = new Date(task.dateTime);
  const now = new Date();

  if (triggerDate <= now) {
    console.warn(`Task ${task.id} is in the past or now → skipping schedule`);
    return { success: false, error: "Past or current time" };
  }

  try {
    await cancelTaskNotification(task.id);

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: task.id,

      content: {
        title: "Task Time! ✓",
        body: task.title + (task.description ? ` — ${task.description}` : ""),
        data: { taskId: task.id },
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },

      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    console.log(
      `Notification scheduled → task: ${task.title}, at: ${triggerDate.toLocaleString()}, id: ${notificationId}`,
    );

    return { success: true, notificationId };
  } catch (error) {
    console.error(
      `Failed to schedule notification for task ${task.id}:`,
      error,
    );
    return { success: false, error: String(error) };
  }
}

export async function cancelTaskNotification(
  identifier: string,
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log(`Cancelled notification: ${identifier}`);
  } catch (error) {
    console.debug(`No notification to cancel for ${identifier}`);
  }
}
