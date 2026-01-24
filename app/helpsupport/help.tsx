import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function HelpSupportMenuScreen() {
  const router = useRouter();

  const menuItems: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: Href;
    color: string;
  }[] = [
    {
      title: "Contact Us",
      icon: "chatbubble-ellipses-outline",
      route: "/helpsupport/contactus/ContactUs",
      color: "#2196F3",
    },
    {
      title: "FAQs",
      icon: "help-circle-outline",
      route: "/helpsupport/faqs/FAQs",
      color: "#4CAF50",
    },
    {
      title: "App Info",
      icon: "information-circle-outline",
      route: "/helpsupport/appinfo/appinfo",
      color: "#F57C00",
    },
    {
      title: "About Us",
      icon: "people-outline",
      route: "/helpsupport/aboutus/AboutUs",
      color: "#673AB7",
    },
  ];

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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: item.color + "15" }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.supportSection}>
          <View style={styles.divider} />
          
          <View style={styles.infoTextContainer}>
            <View style={styles.badge}>
              <Ionicons name="headset-outline" size={14} color="#2196F3" />
              <Text style={styles.badgeText}>Support Center</Text>
            </View>
            
            <Text style={styles.tagline}>We're here to help!</Text>
            <Text style={styles.description}>
              Have questions about your booking or want to host an event? Our team is dedicated to providing you with the best experience.
            </Text>

            <View style={styles.availabilityList}>
              <View style={styles.availabilityItem}>
                <View style={styles.smallIconWrapper}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                </View>
                <View>
                  <Text style={styles.availabilityLabel}>Support Hours</Text>
                  <Text style={styles.availabilityValue}>24/7 Available</Text>
                </View>
              </View>
              <View style={styles.availabilityItem}>
                <View style={styles.smallIconWrapper}>
                  <Ionicons name="flash-outline" size={16} color="#666" />
                </View>
                <View>
                  <Text style={styles.availabilityLabel}>Response Time</Text>
                  <Text style={styles.availabilityValue}>Under 1 hour</Text>
                </View>
              </View>
            </View>

            <View style={styles.commitmentSection}>
              <View style={styles.commitmentHeader}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                <Text style={styles.commitmentTitle}>Our Commitment</Text>
              </View>
              <Text style={styles.commitmentText}>
                We strive to resolve all queries within 24 hours. Your satisfaction is our top priority in making Evently the best event platform.
              </Text>
              <View style={styles.signature}>
                <Text style={styles.signatureText}>Team Evently</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    paddingVertical: 10,
  },
  menuContainer: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f8f8",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  supportSection: {
    marginTop: 30,
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginBottom: 30,
    width: "100%",
  },
  infoTextContainer: {
    alignItems: "flex-start",
    width: "100%",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F310",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2196F3",
    marginLeft: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionIcon: {
    marginBottom: 15,
  },
  tagline: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
    width: "100%",
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  storySection: {
    marginBottom: 30,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#f0f0f0",
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  storyText: {
    fontSize: 14,
    color: "#777",
    lineHeight: 20,
    fontStyle: "italic",
  },
  availabilityList: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
  },
  availabilityItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  smallIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  availabilityLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  availabilityValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  commitmentSection: {
    width: "100%",
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    padding: 24,
  },
  commitmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  commitmentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginLeft: 10,
  },
  commitmentText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 16,
  },
  signature: {
    alignItems: "flex-end",
  },
  signatureText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2196F3",
    fontStyle: "italic",
  },
});
