// src/components/ToastProvider.tsx
import { Ionicons } from "@expo/vector-icons";
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Animated, Dimensions, Platform, StyleSheet, Text } from "react-native";

const { height } = Dimensions.get("window");

interface Toast {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Toast) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  const showToast = useCallback(
    (newToast: Toast) => {
      // Clear any existing toast first
      if (toast) {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => setToast(null));
      }

      setToast(newToast);

      // Slide in + fade in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: Platform.OS === "ios" ? 50 : 60,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => setToast(null));
      }, newToast.duration || 2800);
    },
    [toast],
  );

  const getIcon = (type?: string) => {
    switch (type) {
      case "success":
        return <Ionicons name="checkmark-circle" size={20} color="white" />;
      case "error":
        return <Ionicons name="close-circle" size={20} color="white" />;
      case "warning":
        return <Ionicons name="warning" size={20} color="white" />;
      default:
        return <Ionicons name="information-circle" size={20} color="white" />;
    }
  };

  const getBackground = (type?: string) => {
    switch (type) {
      case "success":
        return "#34C759";
      case "error":
        return "#FF3B30";
      case "warning":
        return "#FF9500";
      default:
        return "#007AFF";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity,
              transform: [{ translateY }],
              backgroundColor: getBackground(toast.type),
            },
          ]}
        >
          {getIcon(toast.type)}
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: Platform.OS === "ios" ? 44 : 28, // safe area / status bar
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 9999,
    gap: 10,
  },
  toastText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
