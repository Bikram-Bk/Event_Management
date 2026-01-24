import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../constants/Colors";
import { useTheme } from "../../../context/ThemeContext";

export default function ContactUs() {
  const router = useRouter();
  const { actualTheme } = useTheme();
  const colors = Colors[actualTheme];

  const handleContact = (type: "email" | "whatsapp" | "phone") => {
    switch (type) {
      case "email":
        Linking.openURL("mailto:bikrambk2244@gmail.com");
        break;
      case "whatsapp":
        Linking.openURL("https://wa.me/+9779749315184"); 
        break;
      case "phone":
        Linking.openURL("tel:+9779749315184"); 
        break;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: actualTheme === 'dark' ? colors.border : '#F8F9FA' }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Contact Us</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Get in Touch</Text>
        <Text style={[styles.description, { color: colors.secondary }]}>
          Have any questions or need assistance? Reach out to us through any of the following channels.
        </Text>

        <View style={styles.contactSection}>
          <TouchableOpacity
            style={[styles.contactItem, { backgroundColor: colors.card }]}
            onPress={() => handleContact("phone")}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="call" size={26} color="#F57C00" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: colors.secondary }]}>Call Us</Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>+977 9749315184</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactItem, { backgroundColor: colors.card }]}
            onPress={() => handleContact("email")}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="mail" size={26} color="#2196F3" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: colors.secondary }]}>Email Us</Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>bikrambk2244@gmail.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactItem, { backgroundColor: colors.card }]}
            onPress={() => handleContact("whatsapp")}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="logo-whatsapp" size={28} color="#4CAF50" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: colors.secondary }]}>WhatsApp</Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>Message us anytime</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    marginTop: 10,
  },
  description: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 24,
  },
  contactSection: {
    gap: 16,
  },
  contactItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  contactValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 2,
  },
});
