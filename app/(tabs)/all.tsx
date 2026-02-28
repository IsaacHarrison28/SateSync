import { Task, useTaskStore } from "@/src/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Section {
  title: string;
  data: Task[];
}

export default function AllTasksScreen() {
  const { tasks } = useTaskStore();
  const router = useRouter();

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
          ? "#FF3B30" // red
          : item.status === "missed"
            ? "#FF9500"
            : "#007AFF";

    return (
      <TouchableOpacity
        style={[
          styles.taskCard,
          item.status !== "pending" && styles.completedCard,
        ]}
        onPress={() => {
          // Optional: navigate to detail/edit screen later
          // router.push(`/task/${item.id}`);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.taskContent}>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{timeStr}</Text>
          </View>

          <View style={styles.mainContent}>
            <Text
              style={[
                styles.title,
                item.status !== "pending" && styles.completedTitle,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            <Text style={[styles.status, { color: statusColor }]}>
              {item.status
                ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                : "Pending"}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>All Tasks</Text>

      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="list-outline" size={80} color="#C7C7CC" />
          <Text style={styles.emptyText}>No tasks scheduled yet</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/add-task")}
          >
            <Text style={styles.addButtonText}>Create Your First Task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  screenTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#000",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  taskCard: {
    backgroundColor: "white",
    borderRadius: 14,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  completedCard: {
    opacity: 0.75,
  },
  taskContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeContainer: {
    width: 60,
    alignItems: "center",
  },
  time: {
    fontSize: 15,
    fontWeight: "500",
    color: "#007AFF",
  },
  mainContent: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: "#8E8E93",
  },
  description: {
    fontSize: 15,
    color: "#636366",
    marginTop: 4,
  },
  status: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  addButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
});
