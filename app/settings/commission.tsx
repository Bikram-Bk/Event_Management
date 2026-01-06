import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export default function CommissionSettings() {
  const router = useRouter();
  const [rate, setRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const apiUrl =
    Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await fetch(`${apiUrl}/api/settings/commission`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setRate(String(data.data.rate));
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const numRate = Number(rate);
    if (isNaN(numRate) || numRate < 0 || numRate > 100) {
      Alert.alert("Invalid Input", "Rate must be between 0 and 100");
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await fetch(`${apiUrl}/api/settings/commission`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rate: numRate }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "Commission rate updated successfully");
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Commission Settings</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Platform Commission Rate (%)</Text>
        <Text style={styles.description}>
          This percentage will be deducted from ticket sales for events not
          owned by the Admin.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={rate}
            onChangeText={setRate}
            keyboardType="numeric"
            placeholder="10"
          />
          <Text style={styles.percent}>%</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: { marginRight: 15 },
  title: { fontSize: 20, fontWeight: "bold", color: "#333" },
  card: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  label: { fontSize: 16, fontWeight: "600", color: "#1F2937", marginBottom: 8 },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
    backgroundColor: "#F9FAFB",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 18,
    color: "#1F2937",
  },
  percent: { fontSize: 18, color: "#6B7280", fontWeight: "600" },
  saveButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: { opacity: 0.7 },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
