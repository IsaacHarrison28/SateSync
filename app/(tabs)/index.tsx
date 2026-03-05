import { useTaskStore, useTodayTasks } from "@/src/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

export default function TodayScreen() {
  const todayTasks = useTodayTasks();
  const router = useRouter();

  const hasTasks = todayTasks.length > 0;

  const renderTask = ({ item }: { item: (typeof todayTasks)[number] }) => {
    const taskTime = new Date(item.datetime);
    const isOverdue = taskTime < new Date();

    const renderRightActions = () => (
      <TouchableOpacity
        style={styles.deleteAction}
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
        style={{
          backgroundColor: "#34C759",
          justifyContent: "center",
          alignItems: "center",
          width: 80,
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        }}
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
          style={[styles.taskCard, isOverdue && styles.overdueCard]}
          onPress={() => {
            router.push({
              pathname: "/edit-task",
              params: { id: item.id },
            });
          }}
          activeOpacity={0.85}
        >
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, isOverdue && styles.overdueTitle]}>
              {item.title}
            </Text>

            <Text style={styles.taskTime}>
              {taskTime.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>

            {item.description && (
              <Text style={styles.taskDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => useTaskStore.getState().markAsCompleted(item.id)}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={28}
                color="#34C759"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
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
              style={styles.actionBtn}
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
    <View style={styles.container}>
      <Text style={styles.header}>Today</Text>

      {!hasTasks ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={80} color="#8E8E93" />
          <Text style={styles.emptyText}>No tasks for today</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/add-task")}
          >
            <Text style={styles.addButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={todayTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {hasTasks && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/add-task")}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 34,
    fontWeight: "700",
    marginTop: 50,
    marginBottom: 20,
    color: "#000",
  },
  listContent: {
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overdueCard: {
    backgroundColor: "#FFF5F5",
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
  },
  taskInfo: { flex: 1, marginRight: 12 },
  taskTitle: { fontSize: 17, fontWeight: "600", color: "#000" },
  overdueTitle: { color: "#FF3B30" },
  taskTime: { fontSize: 15, color: "#8E8E93", marginTop: 4 },
  taskDescription: { fontSize: 15, color: "#636366", marginTop: 6 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionBtn: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    color: "#8E8E93",
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#007AFF",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  deleteAction: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
});
