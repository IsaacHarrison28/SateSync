import { Task, useTaskStore } from "@/src/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Alert,
  SectionList,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

interface Section {
  title: string;
  data: Task[];
}

export default function AllTasksScreen() {
  const { tasks } = useTaskStore();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  // useEffect(() => {
  //   const clearMemory = async () => {
  //     await AsyncStorage.clear();
  //     console.log("Memory cleared");
  //   };
  //   clearMemory();
  // });

  const sections = useMemo(() => {
    const grouped = tasks.reduce<Record<string, Task[]>>((acc, task) => {
      const dateKey = task.datetime?.split("T")[0] ?? "no-date";
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
      return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    return sortedDates.map((date) => {
      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      return {
        title: formattedDate,
        data: grouped[date].sort(
          (a, b) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
        ),
      };
    });
  }, [tasks]);

  const renderTask = ({ item }: { item: Task }) => {
    const taskDate = new Date(item.datetime);
    const timeStr = taskDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const statusColor =
      item.status === "completed"
        ? "#34C759"
        : item.status === "ignored"
          ? "#FF3B30"
          : item.status === "missed"
            ? "#FF9500"
            : "#007AFF";

    const renderRightActions = () => (
      <TouchableOpacity
        className="bg-red-600 justify-center items-center w-20 rounded-tr-2xl rounded-br-2xl"
        onPress={() => {
          Alert.alert(
            "Delete Task",
            "Are you sure you want to delete this task? This cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                  useTaskStore.getState().deleteTask(item.id);
                },
              },
            ],
          );
        }}
      >
        <Ionicons name="trash-outline" size={28} color="white" />
      </TouchableOpacity>
    );

    return (
      <TouchableOpacity
        className={`
          rounded-2xl mb-3 p-4 shadow-sm
          ${isDark ? "bg-gray-800 shadow-gray-900/30" : "bg-white shadow-gray-200/50"}
          ${item.status !== "pending" ? "opacity-75" : ""}
        `}
        onPress={() => {
          router.push({
            pathname: "/edit-task",
            params: { id: item.id },
          });
        }}
        activeOpacity={0.8}
      >
        <Swipeable renderRightActions={renderRightActions}>
          <View className="flex-row items-center">
            <View className="w-[60px] items-center">
              <Text
                className={`text-base font-medium ${isDark ? "text-blue-400" : "text-blue-600"}`}
              >
                {timeStr}
              </Text>
            </View>

            <View className="flex-1 ml-4">
              <Text
                className={`
                  text-base font-semibold
                  ${isDark ? "text-gray-100" : "text-gray-900"}
                  ${item.status !== "pending" ? "line-through text-gray-500 dark:text-gray-400" : ""}
                `}
                numberOfLines={1}
              >
                {item.title}
              </Text>

              {item.description && (
                <Text
                  className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              )}

              <Text
                className="text-xs mt-1.5 font-medium"
                style={{ color: statusColor }}
              >
                {item.status
                  ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                  : "Pending"}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? "#6B7280" : "#C7C7CC"}
            />
          </View>
        </Swipeable>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <Text
      className={`text-base font-semibold mt-6 mb-2 px-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
    >
      {section.title}
    </Text>
  );

  return (
    <View className={`flex-1 ${isDark ? "bg-gray-950" : "bg-gray-100"}`}>
      <Text
        className={`text-4xl font-bold px-5 pt-4 pb-3 mt-10 ${isDark ? "text-gray-100" : "text-gray-900"}`}
      >
        All Tasks
      </Text>

      {tasks.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <Ionicons
            name="list-outline"
            size={80}
            color={isDark ? "#6B7280" : "#C7C7CC"}
          />
          <Text
            className={`text-lg text-center mt-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            No tasks scheduled yet
          </Text>
          <TouchableOpacity
            className={`mt-8 py-4 px-8 rounded-xl ${isDark ? "bg-blue-500" : "bg-blue-600"}`}
            onPress={() => router.push("/add-task")}
          >
            <Text className="text-white text-base font-semibold">
              Create Your First Task
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
}
