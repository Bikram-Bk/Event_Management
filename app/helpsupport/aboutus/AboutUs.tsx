import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function AboutUsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="people" size={50} color="#673AB7" />
          </View>
          <Text style={styles.title}>Our Story</Text>
          <Text style={styles.subtitle}>
            Evently originated as an academic project and evolved into a unified platform for efficient event management.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.cardText}>
            Our mission is to simplify event planning and discovery, making it
            easier for people to connect and create lasting memories. We believe
            that every event, big or small, deserves to be special.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Our Vision</Text>
          <Text style={styles.cardText}>
            To become the world's most trusted and innovative platform for event
            management, fostering a global community of organizers and
            attendees.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What Makes Us Different</Text>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#673AB7" />
            <Text style={styles.featureText}>User-friendly interface</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#673AB7" />
            <Text style={styles.featureText}>Secure and reliable booking</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#673AB7" />
            <Text style={styles.featureText}>Dedicated 24/7 support</Text>
          </View>
        </View>

        <Text style={styles.footerNote}>© 2026 Evently. Built with ❤️ for the community.</Text>
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
  heroSection: {
    alignItems: "center",
    marginVertical: 30,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#673AB715",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
    textAlign: "justify",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 10,
  },
  footerNote: {
    fontSize: 12,
    color: "#ccc",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
  },
});
