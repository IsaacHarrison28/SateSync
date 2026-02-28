import { useTaskStore } from "@/src/store/taskStore";
import { FlatList, Text, View } from "react-native";
export default function AllTasksScreen() {
  const { tasks } = useTaskStore();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        All Tasks
      </Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1 }}>
            <Text>
              {item.date} {item.time} – {item.title}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text>No tasks yet</Text>}
      />
    </View>
  );
}
