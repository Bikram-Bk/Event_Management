import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../constants/Colors";
import { useTheme } from "../../../context/ThemeContext";

export default function FAQs() {
  const router = useRouter();
  const { actualTheme } = useTheme();
  const colors = Colors[actualTheme];

  const faqs = [
    {
      q: "Where are my booked tickets?",
      a: "Go to the 'Events' tab in the bottom navigation to see all your registered and upcoming events.",
    },
    {
      q: "How do I create an event?",
      a: "If you are an organizer, you can find the 'Create Event' button at the top of your home screen or Dashboard.",
    },
    {
      q: "Is my payment secure?",
      a: "Yes, all payments are processed through secure, verified payment gateways like Khalti.",
    },
    {
      q: "How to contact an organizer?",
      a: "Open the event details page and scroll down to the 'Organizer' section to find their profile or contact info.",
    },
    {
      q: "Can I cancel my booking?",
      a: "Cancellation policies vary by event. Please check the event description or contact the organizer directly.",
    },
  ];

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>FAQs</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => (
          <View key={index} style={[styles.faqCard, { backgroundColor: colors.card }]}>
            <View style={styles.questionRow}>
              <Ionicons name="help-circle" size={20} color={colors.tint} />
              <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.q}</Text>
            </View>
            <Text style={[styles.faqAnswer, { color: colors.secondary }]}>{faq.a}</Text>
          </View>
        ))}
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
    marginBottom: 20,
    marginTop: 10,
  },
  faqCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginLeft: 10,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    paddingLeft: 30,
  },
});
