import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";
import { useTheme } from "../context/ThemeContext";

interface ChatButtonProps {
  onPress: () => void;
}

export default function ChatButton({ onPress }: ChatButtonProps) {
  const { actualTheme } = useTheme();
  const colors = Colors[actualTheme];

  // Use accent color (gold) which is visible in both themes
  const buttonColor = colors.accent;
  const iconColor = actualTheme === "dark" ? "#0F172A" : "#FFFFFF";

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: buttonColor, shadowColor: buttonColor },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="chatbubble-ellipses" size={26} color={iconColor} />
      </View>
      {/* Pulse animation effect */}
      <View style={[styles.pulse, { borderColor: buttonColor }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    opacity: 0.3,
  },
});
