import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

function truncateDescription(desc?: string, maxLength = 100): string {
  if (!desc) return "";
  if (desc.length <= maxLength) return desc;
  return desc.substring(0, maxLength - 3) + "...";
}

export async function setupNotificationActions() {
  try {
    await Notifications.setNotificationCategoryAsync("task-reminder", [
      {
        identifier: "mark-done",
        buttonTitle: "Mark Done",
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: "snooze-15",
        buttonTitle: "Snooze 15 min",
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
    console.log("[Notifications] Action category 'task-reminder' registered");
  } catch (error) {
    console.error("[Notifications] Failed to set category", error);
  }
}

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

    if (finalStatus === "granted") {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("task-reminders", {
          name: "Task Reminders",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#2563eb",
          bypassDnd: true,
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      }

      await setupNotificationActions();
    }

    return finalStatus;
  } catch (error) {
    console.error("[requestPermissions] Permission request failed", error);
    return "denied";
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
    console.warn("[scheduleTaskNotification] Skipped – time is past or now", {
      taskId: task.id,
      title: task.title,
      requestedTime: task.dateTime,
    });
    return { success: false, error: "Past or current time" };
  }

  try {
    await cancelTaskNotification(task.id);

    const shortDesc = truncateDescription(task.description, 100);

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: task.id,

      content: {
        title: task.title,
        body: shortDesc || "It's time to start this task!",
        data: { taskId: task.id },

        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,

        categoryIdentifier: "task-reminder",

        ...(Platform.OS === "android" && {
          color: "#2563eb",
        }),
      },

      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    console.info("[scheduleTaskNotification] Scheduled", {
      taskId: task.id,
      title: task.title,
      bodyPreview: shortDesc,
      at: triggerDate.toISOString(),
      notificationId,
    });

    return { success: true, notificationId };
  } catch (error) {
    console.error(
      "[scheduleTaskNotification] Failed",
      { taskId: task.id },
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
    console.debug(`[cancel] Removed notification: ${identifier}`);
  } catch (error) {
    console.debug(`[cancel] No notification found for: ${identifier}`);
  }
}
