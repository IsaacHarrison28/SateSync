import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";

export default function Landing() {
  const router = useRouter();

  return (
    <SafeAreaViewContext className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />

      <View className="flex-1 items-center justify-center px-8">
        {/* Hero section */}
        <View className="items-center mb-16">
          <Bell size={88} color="#2563eb" className="mb-8" />
          <Text className="text-6xl font-bold text-foreground mb-4">
            SateSync
          </Text>
          <Text className="text-xl text-center text-muted-foreground leading-7 max-w-[340px]">
            Schedule tasks for exact moments.{"\n"}
            Get reminded → pick up, reschedule or ignore.
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={() => router.push("/add-task")}
          activeOpacity={0.85}
          className="w-full max-w-xs bg-primary py-6 rounded-3xl items-center shadow-xl shadow-primary/40"
        >
          <Text className="text-white text-2xl font-semibold">
            Add Your First Task
          </Text>
        </TouchableOpacity>

        {/* Hint */}
        <Text className="mt-12 text-base text-muted-foreground text-center opacity-70">
          Your scheduled tasks will appear here
        </Text>
      </View>
    </SafeAreaViewContext>
  );
}
