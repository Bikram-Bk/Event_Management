import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../constants/Colors";
import { useTheme } from "../../../context/ThemeContext";
import { useRegisterEvent } from "../../../hooks/use-attendees";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  eventRow: {
    flexDirection: "row",
    gap: 12,
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  eventDetails: {
    flex: 1,
    justifyContent: "center",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    marginBottom: 2,
    fontWeight: "500",
  },
  eventLocation: {
    fontSize: 12,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  activePayment: {
    borderWidth: 2,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentTextContainer: {
    gap: 2,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  paymentSubtitle: {
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 14,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  confirmText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    marginBottom: 10,
  },
  linkText: {
    fontWeight: "600",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { actualTheme } = useTheme();
  const colors = Colors[actualTheme];
  const [paymentMethod, setPaymentMethod] = useState("KHALTI");
  const [quantity, setQuantity] = useState(1);
  const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/events/${id}`);
      if (!response.ok) throw new Error("Failed to fetch event details");
      const json = await response.json();
      return json.data;
    },
  });

  const registerMutation = useRegisterEvent();
 
  const actionTextColor = actualTheme === 'dark' ? colors.background : '#FFF';

  const handleConfirmPayment = async () => {
    try {
      if (paymentMethod === "KHALTI") {
        const token = await AsyncStorage.getItem("accessToken");
        const response = await fetch(`${API_URL}/api/payments/initiate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventId: id,
            ticketType: "General",
            quantity: quantity,
          }),
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || "Failed to initiate payment");
        if (json.data && json.data.payment_url) {
          router.push({
            pathname: "/payment/khalti",
            params: { url: json.data.payment_url, attendeeId: json.data.attendeeId },
          });
        } else {
          throw new Error("Invalid payment response");
        }
        return;
      }
      await registerMutation.mutateAsync({ eventId: id as string });
      Alert.alert("Order Confirmed! 🎉", "You have successfully registered. Please pay cash upon arrival.", [
        { text: "OK", onPress: () => { router.dismissAll(); router.replace("/(tabs)"); } },
      ]);
    } catch (error) {
      Alert.alert("Payment Failed", error instanceof Error ? error.message : "Please try again later");
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.secondary }]}>Event not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.linkText, { color: colors.tint }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getFullImageUrl = (path: string | undefined | null) => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
  };

  const coverImage = getFullImageUrl(event.coverImage);
  const rawPrice = Number(event.price);
  const price = isNaN(rawPrice) ? 0 : rawPrice;
  const total = price * quantity;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={actualTheme === 'dark' ? "light-content" : "dark-content"} />
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.eventRow}>
            <Image source={coverImage ? { uri: coverImage } : undefined} style={styles.eventImage} contentFit="cover" />
            <View style={styles.eventDetails}>
              <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>{event.title}</Text>
              <Text style={[styles.eventDate, { color: colors.tint }]}>
                {new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })} • {new Date(event.startDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </Text>
              <Text style={[styles.eventLocation, { color: colors.secondary }]} numberOfLines={1}>{event.venueName || event.city}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Number of Tickets</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.secondary }]}>Quantity</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={[styles.quantityButton, { backgroundColor: actualTheme === 'dark' ? colors.border : '#F1F5F9' }]}>
                <Ionicons name="remove" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={[styles.quantityButton, { backgroundColor: actualTheme === 'dark' ? colors.border : '#F1F5F9' }]}>
                <Ionicons name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
        <View style={[styles.paymentOption, styles.activePayment, { backgroundColor: actualTheme === 'dark' ? colors.card : '#F0F9FF', borderColor: colors.tint }]}>
          <View style={styles.paymentRow}>
            <Ionicons name="wallet-outline" size={32} color={colors.tint} />
            <View style={styles.paymentTextContainer}>
              <Text style={[styles.paymentTitle, { color: colors.text }]}>Khalti Digital Wallet</Text>
              <Text style={[styles.paymentSubtitle, { color: colors.secondary }]}>Pay with Khalti</Text>
            </View>
          </View>
          <Ionicons name="radio-button-on" size={24} color={colors.tint} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Details</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.secondary }]}>Ticket Price ({quantity}x)</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>{event.currency} {total.toLocaleString()}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.row}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.tint }]}>{event.currency} {total.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.confirmButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleConfirmPayment} disabled={registerMutation.isPending}>
          {registerMutation.isPending ? (<ActivityIndicator color={actionTextColor} />) : (
            <Text style={[styles.confirmText, { color: actionTextColor }]}>Confirm & Pay {event.currency} {total.toLocaleString()}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
