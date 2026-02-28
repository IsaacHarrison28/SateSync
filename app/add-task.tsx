import { requestPermissions } from "@/src/lib/notifications";
import { useTaskStore } from "@/src/store/taskStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddTask() {
  const router = useRouter();
  const addTask = useTaskStore((s) => s.addTask);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [error, setError] = useState("");

  const titleInputRef = useRef<TextInput>(null);
  const descInputRef = useRef<TextInput>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

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
    if (selectedDate) {
      setDate(selectedDate);
    }
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

    if (date <= new Date()) {
      setError("Please choose a future date/time");
      return;
    }

    setError("");

    try {
      await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dateTime: date.toISOString(),
      });

      router.back();
    } catch (err) {
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
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 p-6">
          <Text className="text-3xl font-bold text-foreground mb-8">
            New Task
          </Text>

          {/* Title */}
          <Text className="text-lg font-medium text-foreground mb-2">
            Task Title
          </Text>
          <TextInput
            ref={titleInputRef}
            className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl px-5 py-4 text-foreground text-base mb-6 min-h-[60px]"
            placeholder="e.g. Call mom or buy groceries"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => descInputRef.current?.focus()}
            style={{ paddingTop: 12 }}
          />

          {/* Description*/}
          <Text className="text-lg font-medium text-foreground mb-2">
            Description (optional)
          </Text>
          <TextInput
            ref={descInputRef}
            className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl px-5 py-4 text-foreground text-base mb-8 min-h-[120px] max-h-[240px]"
            placeholder="Add details, location, people to bring, etc..."
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            returnKeyType="default"
            blurOnSubmit={true}
            style={{ paddingTop: 12 }}
          />

          {/* Date & Time */}
          <Text className="text-lg font-medium text-foreground mb-2">
            When (Date + Time)
          </Text>

          <View className="flex-row justify-between mb-8">
            <TouchableOpacity
              onPress={openDatePicker}
              className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-5 mr-3 items-center"
            >
              <Text className="text-foreground text-base">
                {date.toLocaleDateString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openTimePicker}
              className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-5 items-center"
            >
              <Text className="text-foreground text-base">
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
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTime && (
            <DateTimePicker
              value={date}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onTimeChange}
              style={
                Platform.OS === "ios"
                  ? { width: "100%", height: 220 }
                  : undefined
              }
            />
          )}

          {error ? (
            <Text className="text-red-500 text-base mb-4">{error}</Text>
          ) : null}

          <View className="flex-row justify-between mt-auto">
            <TouchableOpacity
              onPress={() => {
                dismissKeyboard();
                setShowDate(false);
                setShowTime(false);
                router.back();
              }}
              className="flex-1 bg-gray-300 dark:bg-gray-700 py-5 rounded-2xl items-center mr-4"
            >
              <Text className="text-foreground font-medium text-xl">
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
              className="flex-1 bg-primary py-5 rounded-2xl items-center"
            >
              <Text className="text-white font-semibold text-xl">Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
