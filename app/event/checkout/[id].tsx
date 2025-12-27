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
  const [paymentMethod, setPaymentMethod] = useState("COD");

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
      await registerMutation.mutateAsync({
        eventId: id as string,
        // In a real app, we might pass payment details here
        // for now, backend assumes PENDING if not free
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
        "Registration Failed",
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
  const price = Number(event.price) || 0;
  // const serviceFee = price * 0.05; // Example service fee
  const total = price;

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

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity
          style={[styles.paymentOption, styles.activePayment]}
          onPress={() => setPaymentMethod("COD")}
        >
          <View style={styles.paymentRow}>
            <Ionicons name="cash-outline" size={24} color={Colors.light.tint} />
            <View style={styles.paymentTextContainer}>
              <Text style={styles.paymentTitle}>Cash on Delivery</Text>
              <Text style={styles.paymentSubtitle}>Pay at the venue</Text>
            </View>
          </View>
          <Ionicons
            name="radio-button-on"
            size={24}
            color={Colors.light.tint}
          />
        </TouchableOpacity>

        {/* Disabled Online Payment Option (Visual Only) */}
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
            <Text style={styles.rowLabel}>Ticket Price (1x)</Text>
            <Text style={styles.rowValue}>
              {event.currency} {price.toLocaleString()}
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
});
