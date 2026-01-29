import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";

export default function CommissionSettings() {
  const router = useRouter();
  const { actualTheme } = useTheme();
  const colors = Colors[actualTheme];
  const [rate, setRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

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
        showToast({ message: data.error, type: "error" });
      }
    } catch (error) {
      showToast({ message: "Failed to fetch settings", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const numRate = Number(rate);
    if (isNaN(numRate) || numRate < 0 || numRate > 100) {
      showToast({ message: "Rate must be between 0 and 100", type: "warning" });
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
        showToast({ message: "Commission rate updated successfully", type: "success" });
      } else {
        showToast({ message: data.error, type: "error" });
      }
    } catch (error) {
      showToast({ message: "Failed to update settings", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>Commission Settings</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>Platform Commission Rate (%)</Text>
        <Text style={[styles.description, { color: colors.secondary }]}>
          This percentage will be deducted from ticket sales for events not
          owned by the Admin.
        </Text>

        <View style={[styles.inputContainer, { backgroundColor: actualTheme === 'dark' ? colors.background : '#F9FAFB', borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={rate}
            onChangeText={setRate}
            keyboardType="numeric"
            placeholder="10"
            placeholderTextColor={colors.secondary}
          />
          <Text style={[styles.percent, { color: colors.secondary }]}>%</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.tint }, saving && styles.disabledButton]}
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: { 
    padding: 5,
  },
  title: { 
    fontSize: 20, 
    fontWeight: "700", 
    flex: 1,
    textAlign: 'center',
  },
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
