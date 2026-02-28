import {
  cancelTaskNotification,
  scheduleTaskNotification,
} from "@/src/lib//notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as Notifications from "expo-notifications";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Task {
  id: string;
  title: string;
  time: string;
  dateTime: string;
  completed?: boolean;
  notified?: boolean;
  description?: string;
  notificationId?: string;
  cancelled?: boolean;
  createdAt?: string;
}

export interface Task {
  id: string; // uuid or Date.now().toString()
  title: string;
  description?: string;
  date: string; // ISO date string → "2026-03-01"
  time: string; // "14:30" (24h format preferred)
  datetime: string; // full ISO → "2026-03-01T14:30:00.000Z"  ← most important
  notificationId?: string; // returned by scheduleNotificationAsync
  status?: "pending" | "completed" | "ignored" | "missed"; // optional for later
}

interface TaskStore {
  tasks: Task[];
  addTask: (
    task: Omit<Task, "id" | "createdAt" | "completed" | "cancelled">,
  ) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: async (newTaskInput) => {
        try {
          const id = await Crypto.randomUUID();
          const createdAt = new Date().toISOString();

          const task: Task = {
            ...newTaskInput,
            id,
            createdAt,
            completed: false,
            cancelled: false,
            notified: false,
          };

          console.log("[addTask] generated Id: ", id);
          console.log(
            "[addTask] Creating task:",
            JSON.stringify(task, null, 2),
          );

          const perms = await Notifications.getPermissionsAsync();
          console.log("[addTask] Current permissions:", perms);

          const result = await scheduleTaskNotification({
            id: task.id,
            title: task.title,
            description: task.description,
            dateTime: task.dateTime,
          });

          console.log("[addTask] Schedule result:", result);

          if (result.success && result.notificationId) {
            task.notificationId = result.notificationId;
            task.notified = true;
          } else {
            console.warn("[addTask] Notification failed, still adding task");
          }

          set((state) => {
            const newTasks = [...state.tasks, task];
            console.log("[addTask] New tasks length:", newTasks.length);
            console.log(
              "[addTask] All tasks:",
              JSON.stringify(newTasks, null, 2),
            );
            return { tasks: newTasks };
          });

          const stored = await AsyncStorage.getItem("tasks-storage-v1");
          console.log("[addTask] Raw AsyncStorage after add:", stored);
        } catch (err) {
          console.error("[addTask] Full error:", err);
        }
      },

      updateTask: async (id, updates) => {
        const oldTask = get().tasks.find((t) => t.id === id);
        if (!oldTask) return;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t,
          ),
        }));

        if (updates.dateTime && updates.dateTime !== oldTask.dateTime) {
          const updatedTask = { ...oldTask, ...updates };

          if (oldTask.notificationId) {
            await cancelTaskNotification(oldTask.notificationId);
          }

          const result = await scheduleTaskNotification({
            id: updatedTask.id,
            title: updatedTask.title,
            description: updatedTask.description,
            dateTime: updatedTask.dateTime,
          });

          if (result.success && result.notificationId) {
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === id
                  ? { ...t, notificationId: result.notificationId }
                  : t,
              ),
            }));
          }
        }
      },

      deleteTask: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (task?.notificationId) {
          await cancelTaskNotification(task.notificationId);
        }

        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },
    }),
    {
      name: "tasks-storage-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tasks: state.tasks }),
    },
  ),
);
