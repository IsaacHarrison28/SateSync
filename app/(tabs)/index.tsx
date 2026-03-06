import { useTaskStore, useTodayTasks } from "@/src/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

export default function TodayScreen() {
  const todayTasks = useTodayTasks();
  const router = useRouter();
  const scheme = useColorScheme();

  const isDark = scheme === "dark";

  const hasTasks = todayTasks.length > 0;

  const renderTask = ({ item }: { item: (typeof todayTasks)[number] }) => {
    const taskTime = new Date(item.datetime);
    const isOverdue = taskTime < new Date();

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

    const renderLeftActions = () => (
      <TouchableOpacity
        className="bg-green-500 justify-center items-center w-20 rounded-tl-2xl rounded-bl-2xl"
        onPress={() => useTaskStore.getState().markAsCompleted(item.id)}
      >
        <Ionicons name="checkmark" size={28} color="white" />
      </TouchableOpacity>
    );

    return (
      <Swipeable
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
      >
        <TouchableOpacity
          className={`
            rounded-2xl p-4 mb-3 flex-row justify-between items-center shadow-sm
            ${isDark ? "bg-gray-800 shadow-gray-900/30" : "bg-white shadow-gray-200/50"}
            ${isOverdue ? (isDark ? "bg-red-950/40 border-l-4 border-red-400" : "bg-red-50 border-l-4 border-red-500") : ""}
          `}
          onPress={() => {
            router.push({
              pathname: "/edit-task",
              params: { id: item.id },
            });
          }}
          activeOpacity={0.85}
        >
          <View className="flex-1 mr-3">
            <Text
              className={`
                text-base font-semibold
                ${isDark ? "text-gray-100" : "text-gray-900"}
                ${isOverdue ? (isDark ? "text-red-400" : "text-red-600") : ""}
              `}
            >
              {item.title}
            </Text>

            <Text
              className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {taskTime.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>

            {item.description && (
              <Text
                className={`text-sm mt-1.5 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
          </View>

          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              className="p-1"
              onPress={() => useTaskStore.getState().markAsCompleted(item.id)}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={28}
                color="#34C759"
              />
            </TouchableOpacity>

            <TouchableOpacity
              className="p-1"
              onPress={() => {
                const newTime = new Date(item.datetime);
                newTime.setMinutes(newTime.getMinutes() + 15);
                useTaskStore.getState().updateTask(item.id, {
                  datetime: newTime.toISOString(),
                });
              }}
            >
              <Ionicons name="time-outline" size={28} color="#FF9500" />
            </TouchableOpacity>

            <TouchableOpacity
              className="p-1"
              onPress={() => useTaskStore.getState().markAsIgnored(item.id)}
            >
              <Ionicons name="close-circle-outline" size={28} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View className={`flex-1 px-4 ${isDark ? "bg-gray-950" : "bg-gray-100"}`}>
      <Text
        className={`text-4xl font-bold mt-[50px] mb-5 ${isDark ? "text-gray-100" : "text-gray-900"}`}
      >
        Today
      </Text>

      {!hasTasks ? (
        <View className="flex-1 justify-center items-center gap-4">
          <Ionicons
            name="calendar-outline"
            size={80}
            color={isDark ? "#9ca3af" : "#9ca3af"}
          />
          <Text
            className={`text-lg text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            No tasks for today
          </Text>
          <TouchableOpacity
            className={`py-4 px-8 rounded-xl mt-4 ${isDark ? "bg-blue-500" : "bg-blue-600"}`}
            onPress={() => router.push("/add-task")}
          >
            <Text className="text-white text-lg font-semibold">Add Task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={todayTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {hasTasks && (
        <TouchableOpacity
          className={`absolute bottom-6 right-6 w-16 h-16 rounded-full justify-center items-center shadow-lg ${
            isDark
              ? "bg-blue-500 shadow-gray-900/50"
              : "bg-blue-600 shadow-gray-200/50"
          }`}
          onPress={() => router.push("/add-task")}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}
