import { useTaskStore } from "@/src/store/taskStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditTask() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, updateTask, deleteTask } = useTaskStore();

  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.notFoundText}>Task not found</Text>
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

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

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
          onPress: async () => {
            try {
              await deleteTask(task.id);
              router.back();
            } catch (err) {
              Alert.alert("Error", "Failed to delete task");
              console.error("Delete failed:", err);
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
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.title}>Edit Task</Text>

            {/* Delete button */}
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Delete Task</Text>
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.label}>Title</Text>
            <TextInput
              ref={titleRef}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor="#999"
              style={styles.input}
              returnKeyType="next"
              accessibilityLabel="Task title"
              accessibilityHint="Enter the main title of your task"
            />

            {/* Description */}
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add details, notes, location..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              style={[styles.input, styles.textArea]}
              accessibilityLabel="Task description"
              accessibilityHint="Optional details about the task"
            />

            {/* Date & Time */}
            <Text style={styles.label}>Date & Time</Text>

            {Platform.OS === "ios" ? (
              <View style={styles.iosPickerContainer}>
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
                <View style={styles.androidPickerRow}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={styles.pickerButton}
                  >
                    <Text style={styles.pickerButtonText}>
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
                    style={styles.pickerButton}
                  >
                    <Text style={styles.pickerButtonText}>
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

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                style={[styles.button, styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundText: {
    fontSize: 18,
    color: "#666",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 28,
  },
  deleteButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  deleteButtonText: {
    color: "#ff3b30",
    fontSize: 17,
    fontWeight: "500",
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 12,
    padding: 14,
    fontSize: 17,
    backgroundColor: "white",
    marginBottom: 20,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  iosPickerContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  androidPickerRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  pickerButton: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 12,
    alignItems: "center",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 15,
    marginVertical: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "white",
  },
});
