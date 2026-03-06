import { useToast } from "@/components/ToastProvider";
import { useTaskStore } from "@/src/store/taskStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditTask() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, updateTask, deleteTask } = useTaskStore();
  const { showToast } = useToast();

  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return (
      <SafeAreaView
        className={`flex-1 justify-center items-center ${isDark ? "bg-gray-950" : "bg-gray-100"}`}
      >
        <Text
          className={`text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}
        >
          Task not found
        </Text>
      </SafeAreaView>
    );
  }

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [date, setDate] = useState(new Date(task.datetime));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState("");

  const titleRef = useRef<TextInput>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const now = new Date();
    if (date.getTime() <= now.getTime() + 60000) {
      setError("Time must be at least 1 minute in the future");
      return;
    }

    setError("");

    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        datetime: date.toISOString(),
      });

      router.back();
    } catch (err) {
      setError("Failed to update task");
      console.error("Update failed:", err);

      showToast({
        message: "Failed to update task",
        type: "error",
        duration: 4000,
      });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            try {
              deleteTask(task.id);
              router.back();
            } catch (err) {
              Alert.alert("Error", "Failed to delete task");
              console.error("Delete failed:", err);

              showToast({
                message: "Failed to delete task",
                type: "error",
                duration: 4000,
              });
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        className={`flex-1 ${isDark ? "bg-gray-950" : "bg-gray-100"}`}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
          >
            <Text
              className={`text-4xl font-bold mb-7 ${isDark ? "text-gray-100" : "text-gray-900"}`}
            >
              Edit Task
            </Text>

            <TouchableOpacity
              onPress={handleDelete}
              className="self-start mb-6 px-3 py-2"
            >
              <Text className="text-red-500 text-base font-medium">
                Delete Task
              </Text>
            </TouchableOpacity>

            <Text
              className={`text-base font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Title
            </Text>
            <TextInput
              ref={titleRef}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor="#9ca3af"
              className={`border rounded-xl px-4 py-4 text-base mb-5 ${
                isDark
                  ? "bg-gray-800 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              returnKeyType="next"
              accessibilityLabel="Task title"
              accessibilityHint="Enter the main title of your task"
            />

            <Text
              className={`text-base font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Description (optional)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add details, notes, location..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              className={`border rounded-xl px-4 py-4 text-base mb-5 min-h-[100px] text-align-vertical-top ${
                isDark
                  ? "bg-gray-800 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              accessibilityLabel="Task description"
              accessibilityHint="Optional details about the task"
            />

            <Text
              className={`text-base font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Date & Time
            </Text>

            {Platform.OS === "ios" ? (
              <View className="mb-6 items-center">
                <DateTimePicker
                  value={date}
                  mode="datetime"
                  display="inline"
                  onChange={(_, selected) => selected && setDate(selected)}
                  minimumDate={new Date()}
                />
              </View>
            ) : (
              <>
                <View className="flex-row gap-3 mb-5">
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className={`flex-1 px-4 py-4 rounded-xl border items-center ${
                      isDark
                        ? "bg-gray-800 border-gray-600"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`${isDark ? "text-gray-100" : "text-gray-900"} text-base font-medium`}
                    >
                      {date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    className={`flex-1 px-4 py-4 rounded-xl border items-center ${
                      isDark
                        ? "bg-gray-800 border-gray-600"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`${isDark ? "text-gray-100" : "text-gray-900"} text-base font-medium`}
                    >
                      {date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    minimumDate={new Date()}
                  />
                )}

                {showTimePicker && (
                  <DateTimePicker
                    value={date}
                    mode="time"
                    display="default"
                    onChange={onTimeChange}
                  />
                )}
              </>
            )}

            {error ? (
              <Text className="text-red-500 text-base my-3">{error}</Text>
            ) : null}

            <View className="flex-row gap-3 mt-8">
              <TouchableOpacity
                onPress={() => router.back()}
                className={`flex-1 py-4 rounded-xl items-center ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`${isDark ? "text-gray-100" : "text-gray-800"} text-base font-semibold`}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                className={`flex-1 py-4 rounded-xl items-center ${
                  isDark ? "bg-blue-500" : "bg-blue-600"
                }`}
              >
                <Text className="text-white text-base font-semibold">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
