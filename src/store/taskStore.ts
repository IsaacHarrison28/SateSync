import {
  cancelTaskNotification,
  scheduleTaskNotification,
} from "@/src/lib/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as Notifications from "expo-notifications";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

export interface Task {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  datetime: string;
  notificationId?: string;
  status?: "pending" | "completed" | "ignored" | "missed" | "cancelled";
}

interface TaskStore {
  tasks: Task[];
  addTask: (
    taskInput: Omit<Task, "id" | "notificationId" | "status">,
  ) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  markAsCompleted: (id: string) => Promise<void>;
  markAsIgnored: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: async (newTaskInput) => {
        try {
          const id = await Crypto.randomUUID();

          // Ensure datetime is always set and valid
          let datetime = newTaskInput.datetime;
          if (!datetime && newTaskInput.date && newTaskInput.time) {
            datetime = `${newTaskInput.date}T${newTaskInput.time}:00.000Z`;
          }
          if (!datetime) {
            throw new Error(
              "Task must have either 'datetime' or both 'date' and 'time'",
            );
          }

          const task: Task = {
            ...newTaskInput,
            id,
            datetime,
            status: "pending",
          };

          // Optional: check permissions early
          const { status } = await Notifications.getPermissionsAsync();
          if (status !== "granted") {
            console.warn("[addTask] Notifications not granted yet");
            // You could request here, but better to handle at app start / before add
          }

          const result = await scheduleTaskNotification({
            id: task.id,
            title: task.title,
            description: task.description,
            dateTime: task.datetime,
          });

          if (result.success && result.notificationId) {
            task.notificationId = result.notificationId;
          } else {
            console.warn(
              "[addTask] Notification scheduling failed – task still saved",
            );
          }

          set((state) => {
            const newTasks = [...state.tasks, task].sort(
              (a, b) =>
                new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
            );
            return { tasks: newTasks };
          });
        } catch (err) {
          console.error("[addTask] Failed:", err);
          // Optionally: show toast / alert to user here
        }
      },

      updateTask: async (id, updates) => {
        const oldTask = get().tasks.find((t) => t.id === id);
        if (!oldTask) return;

        const newTask = { ...oldTask, ...updates };

        if (updates.datetime && updates.datetime !== oldTask.datetime) {
          if (oldTask.notificationId) {
            await cancelTaskNotification(oldTask.notificationId).catch(
              console.warn,
            );
          }

          const result = await scheduleTaskNotification({
            id: newTask.id,
            title: newTask.title,
            description: newTask.description,
            dateTime: newTask.datetime,
          });

          if (result.success && result.notificationId) {
            newTask.notificationId = result.notificationId;
          } else {
            newTask.notificationId = undefined;
          }
        }

        set((state) => ({
          tasks: state.tasks
            .map((t) => (t.id === id ? newTask : t))
            .sort(
              (a, b) =>
                new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
            ),
        }));
      },

      deleteTask: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (task?.notificationId) {
          await cancelTaskNotification(task.notificationId).catch(console.warn);
        }

        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      markAsCompleted: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        if (task.notificationId && task.status === "pending") {
          await cancelTaskNotification(task.notificationId).catch(console.warn);
        }

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, status: "completed", notificationId: undefined }
              : t,
          ),
        }));
      },

      markAsIgnored: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        if (task.notificationId && task.status === "pending") {
          await cancelTaskNotification(task.notificationId).catch(console.warn);
        }

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, status: "ignored", notificationId: undefined }
              : t,
          ),
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

export const useTodayTasks = () =>
  useTaskStore(
    useShallow((state) => {
      const todayStart = new Date().toISOString().split("T")[0];

      const tasks = Array.isArray(state.tasks) ? state.tasks : [];

      return tasks.filter(
        (t) => t?.datetime?.startsWith(todayStart) && t?.status === "pending",
      );
    }),
  );

export const usePendingTasks = () =>
  useTaskStore(
    useShallow((state) => state.tasks.filter((t) => t.status === "pending")),
  );

export const useTodayCompleted = () =>
  useTaskStore(
    useShallow((state) => {
      const todayStart = new Date().toISOString().split("T")[0];
      return state.tasks.filter(
        (t) =>
          t.datetime.startsWith(todayStart) &&
          (t.status === "completed" || t.status === "ignored"),
      );
    }),
  );
