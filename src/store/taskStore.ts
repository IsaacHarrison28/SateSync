import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Task {
  id: string;
  title: string;
  dateTime: string;
  completed: boolean;
  notified: boolean;
}

interface TaskStore {
  tasks: Task[];
  addTask: (title: string, dateTime: Date) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (title, dateTime) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: Date.now().toString() + Math.random().toString(36).slice(2),
              title,
              dateTime: dateTime.toISOString(),
              completed: false,
              notified: false,
            },
          ],
        })),
    }),
    {
      name: "satesync-tasks-storage",
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => (Platform.OS !== "web" ? state : { tasks: [] }),
    },
  ),
);
