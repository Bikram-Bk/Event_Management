import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { Image } from "expo-image";

export default function PaymentSuccessScreen() {
  const router = useRouter();

  const handleFinish = () => {
    router.dismissAll();
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="checkmark-circle"
            size={100}
            color={Colors.light.tint}
          />
        </View>
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.message}>
          Your ticket has been booked successfully. You can find it in your
          upcoming events.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleFinish}>
          <Text style={styles.buttonText}>My Events</Text>
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
