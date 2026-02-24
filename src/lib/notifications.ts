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

export async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Notifications permission denied. Tasks won’t be reminded.");
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2563eb",
    });
  }

  return true;
}

export async function scheduleTaskNotification(task: {
  id: string;
  title: string;
  dateTime: string;
}) {
  const triggerDate = new Date(task.dateTime);

  if (triggerDate <= new Date()) {
    console.warn("Cannot schedule past or current notification");
    return;
  }

  try {
    const trigger: Notifications.CalendarTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      year: triggerDate.getFullYear(),
      month: triggerDate.getMonth(), // Note: 0-based (Jan = 0)
      day: triggerDate.getDate(),
      hour: triggerDate.getHours(),
      minute: triggerDate.getMinutes(),
      second: 0,
      repeats: false,
    };

    await Notifications.scheduleNotificationAsync({
      identifier: task.id,
      content: {
        title: "Task Reminder",
        body: `It's time to: ${task.title}`,
        data: { taskId: task.id },
      },
      trigger,
    });

    console.log(
      `Notification scheduled for ${task.title} at ${triggerDate.toLocaleString()}`,
    );
  } catch (error) {
    console.error("Schedule failed:", error);
  }
}

export async function cancelTaskNotification(taskId: string) {
  await Notifications.cancelScheduledNotificationAsync(taskId);
}
