import { useToast } from "@/components/ToastProvider";
import { requestPermissions } from "@/src/lib/notifications";
import { useTaskStore } from "@/src/store/taskStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Keyboard,
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

export default function AddTask() {
  const router = useRouter();
  const addTask = useTaskStore((s) => s.addTask);
  const { showToast } = useToast();

  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [error, setError] = useState("");

  const titleInputRef = useRef<TextInput>(null);
  const descInputRef = useRef<TextInput>(null);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const openDatePicker = () => {
    dismissKeyboard();
    setShowTime(false);
    setShowDate(true);
  };

  const openTimePicker = () => {
    dismissKeyboard();
    setShowDate(false);
    setShowTime(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDate(Platform.OS === "ios");
    if (selectedDate) setDate(selectedDate);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTime(Platform.OS === "ios");
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please enter a task title");
      return;
    }

    const now = new Date();
    if (date.getTime() <= now.getTime() + 60000) {
      setError("Please choose a time at least 1 minute from now");
      return;
    }

    const status = await requestPermissions();
    if (status !== "granted") {
      setError(
        "Notifications are required to schedule tasks. Please enable them in Settings.",
      );
      return;
    }

    setError("");

    try {
      await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        datetime: date.toISOString(),
      });

      router.back();
    } catch (err) {
      showToast({
        message: "Task scheduling failed!",
        type: "error",
        duration: 2500,
      });
      console.error("Failed to add task:", err);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        dismissKeyboard();
        setShowDate(false);
        setShowTime(false);
      }}
    >
      <SafeAreaView
        className={`flex-1 ${isDark ? "bg-gray-950" : "bg-gray-100"}`}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 24, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            className={`text-3xl font-bold mb-8 ${isDark ? "text-gray-100" : "text-gray-900"}`}
          >
            New Task
          </Text>

          <Text
            className={`text-lg font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            Task Title
          </Text>
          <TextInput
            ref={titleInputRef}
            className={`border rounded-2xl px-5 py-4 text-base mb-6 min-h-[60px] ${
              isDark
                ? "bg-gray-800 border-gray-600 text-gray-100"
                : "bg-gray-100 border-gray-300 text-gray-900"
            }`}
            placeholder="e.g. Call mom or buy groceries"
            placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
            value={title}
            onChangeText={setTitle}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => descInputRef.current?.focus()}
          />

          <Text
            className={`text-lg font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            Description (optional)
          </Text>
          <TextInput
            ref={descInputRef}
            className={`border rounded-2xl px-5 py-4 text-base mb-8 min-h-[120px] ${
              isDark
                ? "bg-gray-800 border-gray-600 text-gray-100"
                : "bg-gray-100 border-gray-300 text-gray-900"
            }`}
            placeholder="Add details, location, people to bring, etc..."
            placeholderTextColor={isDark ? "#9ca3af" : "#9ca3af"}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            returnKeyType="default"
            blurOnSubmit={true}
          />

          <Text
            className={`text-lg font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            When (Date + Time)
          </Text>

          {Platform.OS === "ios" ? (
            <View className="mb-8">
              <DateTimePicker
                value={date}
                mode="datetime"
                display="inline"
                onChange={(event, selected) => {
                  if (selected) setDate(selected);
                }}
                minimumDate={new Date()}
              />
            </View>
          ) : (
            <>
              <View className="flex-row justify-between mb-8">
                <TouchableOpacity
                  onPress={openDatePicker}
                  className={`flex-1 border rounded-xl px-4 py-5 mr-3 items-center ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-gray-100"
                      : "bg-gray-100 border-gray-300 text-gray-900"
                  }`}
                >
                  <Text
                    className={`${isDark ? "text-gray-100" : "text-gray-900"} text-base`}
                  >
                    {date.toLocaleDateString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={openTimePicker}
                  className={`flex-1 border rounded-xl px-4 py-5 items-center ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-gray-100"
                      : "bg-gray-100 border-gray-300 text-gray-900"
                  }`}
                >
                  <Text
                    className={`${isDark ? "text-gray-100" : "text-gray-900"} text-base`}
                  >
                    {date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDate && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}

              {showTime && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  display="inline"
                  onChange={onTimeChange}
                />
              )}
            </>
          )}

          {error ? (
            <Text className="text-red-500 text-base mb-6">{error}</Text>
          ) : null}

          {/* Bottom buttons */}
          <View className="flex-row justify-between mt-auto pb-6">
            <TouchableOpacity
              onPress={() => {
                dismissKeyboard();
                setShowDate(false);
                setShowTime(false);
                router.back();
              }}
              className={`flex-1 py-5 rounded-2xl items-center mr-4 ${
                isDark ? "bg-gray-700" : "bg-gray-300"
              }`}
            >
              <Text
                className={`${isDark ? "text-gray-100" : "text-gray-900"} font-medium text-xl`}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                dismissKeyboard();
                setShowDate(false);
                setShowTime(false);
                handleSave();
              }}
              className={`flex-1 py-5 rounded-2xl items-center ${
                isDark ? "bg-blue-500" : "bg-blue-600"
              }`}
            >
              <Text className="text-white font-semibold text-xl">Schedule</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
