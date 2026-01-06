import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Constants from "expo-constants";
import { useState } from "react";
import { Colors, Layout } from "../../../constants/Colors";
import { useRegisterEvent } from "../../../hooks/use-attendees";

const { width } = Dimensions.get("window");

const API_URL =
  Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("KHALTI");
  const [quantity, setQuantity] = useState(1);

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/events/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch event details");
      }
      const json = await response.json();
      return json.data;
    },
  });

  const registerMutation = useRegisterEvent();

  const handleConfirmPayment = async () => {
    try {
      if (paymentMethod === "KHALTI") {
        // Initiate Khalti Payment
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

        if (!response.ok) {
          throw new Error(json.error || "Failed to initiate payment");
        }

        if (json.data && json.data.payment_url) {
          // Navigate to WebView
          router.push({
            pathname: "/payment/khalti",
            params: {
              url: json.data.payment_url,
              attendeeId: json.data.attendeeId,
            },
          });
        } else {
          throw new Error("Invalid payment response");
        }
        return;
      }

      // COD Logic
      await registerMutation.mutateAsync({
        eventId: id as string,
      });

      Alert.alert(
        "Order Confirmed! 🎉",
        "You have successfully registered. Please pay cash upon arrival.",
        [
          {
            text: "OK",
            onPress: () => {
              router.dismissAll();
              router.replace("/(tabs)");
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Payment Failed",
        error instanceof Error ? error.message : "Please try again later"
      );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Helper to fix image URLs (duplicated from EventDetails, ideally moved to utils)
  const getFullImageUrl = (path: string | undefined | null) => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
  };

  const coverImage = getFullImageUrl(event.coverImage);
  // Ensure price is treated as number. API might return string for Decimal.
  // If event is mistakenly marked free but has price, or vice versa, handle it.
  const rawPrice = Number(event.price);
  const price = isNaN(rawPrice) ? 0 : rawPrice;
  const total = price * quantity;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Summary */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.card}>
          <View style={styles.eventRow}>
            <Image
              source={coverImage ? { uri: coverImage } : undefined}
              style={styles.eventImage}
              contentFit="cover"
            />
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {event.title}
              </Text>
              <Text style={styles.eventDate}>
                {new Date(event.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                })}{" "}
                •{" "}
                {new Date(event.startDate).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text style={styles.eventLocation} numberOfLines={1}>
                {event.venueName || event.city}
              </Text>
            </View>
          </View>
        </View>

        {/* Quantity Selection */}
        <Text style={styles.sectionTitle}>Number of Tickets</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Quantity</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.quantityButton}
              >
                <Ionicons name="remove" size={20} color={Colors.light.text} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={styles.quantityButton}
              >
                <Ionicons name="add" size={20} color={Colors.light.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {/* Khalti Payment Option */}
        <View style={[styles.paymentOption, styles.activePayment]}>
          <View style={styles.paymentRow}>
            <Ionicons
              name="wallet-outline"
              size={32}
              color={Colors.light.tint}
            />
            <View style={styles.paymentTextContainer}>
              <Text style={styles.paymentTitle}>Khalti Digital Wallet</Text>
              <Text style={styles.paymentSubtitle}>Pay with Khalti</Text>
            </View>
          </View>
          <Ionicons
            name="radio-button-on"
            size={24}
            color={Colors.light.tint}
          />
        </View>

        {/* Disabled Card Payment Option (Visual Only) */}
        <View style={[styles.paymentOption, { opacity: 0.5 }]}>
          <View style={styles.paymentRow}>
            <Ionicons
              name="card-outline"
              size={24}
              color={Colors.light.secondary}
            />
            <View style={styles.paymentTextContainer}>
              <Text style={styles.paymentTitle}>Credit / Debit Card</Text>
              <Text style={styles.paymentSubtitle}>Coming soon</Text>
            </View>
          </View>
          <Ionicons
            name="radio-button-off"
            size={24}
            color={Colors.light.secondary}
          />
        </View>

        {/* Price Breakdown */}
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Ticket Price ({quantity}x)</Text>
            <Text style={styles.rowValue}>
              {event.currency} {total.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.divider]} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {event.currency} {total.toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmPayment}
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.confirmText}>
              Confirm & Pay {event.currency} {total.toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
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
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Layout.shadows.small,
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
    color: Colors.light.text,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: Colors.light.tint,
    marginBottom: 2,
    fontWeight: "500",
  },
  eventLocation: {
    fontSize: 12,
    color: Colors.light.secondary,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 12,
  },
  activePayment: {
    borderColor: Colors.light.tint,
    backgroundColor: "#F0F9FF",
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
    color: Colors.light.text,
  },
  paymentSubtitle: {
    fontSize: 12,
    color: Colors.light.secondary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 14,
    color: Colors.light.secondary,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.light.tint,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  confirmButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.secondary,
    marginBottom: 10,
  },
  linkText: {
    color: Colors.light.tint,
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
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
});
