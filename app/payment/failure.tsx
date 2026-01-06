import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

export default function PaymentFailureScreen() {
  const router = useRouter();

  const handleRetry = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle" size={100} color="#EF4444" />
        </View>
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.message}>
          We couldn't process your payment. Please try again or choose a
          different payment method.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleRetry}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: Colors.light.secondary,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
