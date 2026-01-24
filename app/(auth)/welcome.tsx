import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { actualTheme } = useTheme();
  const colors = Colors[actualTheme];

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading]);

  if (isLoading || user) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.tint, shadowColor: colors.tint }]}>
          <Ionicons name="sparkles" size={60} color="#fff" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Evently</Text>
        <Text style={[styles.tagline, { color: colors.secondary }]}>Discover. Create. Celebrate.</Text>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.buttonPrimary, { backgroundColor: colors.tint, shadowColor: colors.tint }]}
          onPress={() => router.push("/(auth)/sign-up")}
        >
          <Text style={styles.buttonPrimaryText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonSecondary, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(auth)/sign-in")}
        >
          <Text style={[styles.buttonSecondaryText, { color: colors.text }]}>
            I already have an account
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#007AFF",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#000",
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  bottomContainer: {
    padding: 24,
    paddingBottom: 48,
  },
  buttonPrimary: {
    backgroundColor: "#007AFF",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonPrimaryText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  buttonSecondaryText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
  },
});
