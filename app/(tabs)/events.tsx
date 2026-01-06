import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  StatusBar,
  RefreshControl,
} from "react-native";
import { useUserEvents } from "../../hooks/use-attendees";
import { useState, useCallback } from "react";
import { Colors } from "../../constants/Colors";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

export default function MyEventsScreen() {
  const router = useRouter();
  const { data: events, isLoading, refetch } = useUserEvents();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  console.log("data", events);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  const registeredEvents = events || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Events</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.tint]}
          />
        }
      >
        {registeredEvents.length > 0 ? (
          registeredEvents.map((registration: any) => {
            const event = registration.event;
            return (
              <TouchableOpacity
                key={registration.id}
                style={styles.eventCard}
                onPress={() => router.push(`/event/${event.id}`)}
              >
                <Image
                  source={{
                    uri: event.coverImage
                      ? event.coverImage.startsWith("http")
                        ? event.coverImage
                        : `${API_URL}${event.coverImage}`
                      : "https://via.placeholder.com/150",
                  }}
                  style={styles.eventImage}
                />

                <View style={styles.eventInfo}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        registration.status === "REGISTERED"
                          ? styles.statusRegistered
                          : styles.statusWaitlist,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {registration.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#666"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.eventDate}>
                      {new Date(event.startDate).toLocaleDateString()} at{" "}
                      {new Date(event.startDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#666"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.eventLocation}>
                      {event.location || "Online"}
                    </Text>
                  </View>

                  <View style={styles.footer}>
                    <Text style={styles.ticketType}>
                      {registration.ticketType || "General Admission"}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-clear-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No registered events yet</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push("/(tabs)")}
            >
              <Text style={styles.browseButtonText}>Browse Events</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 20,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  content: {
    padding: 20,
    paddingBottom: 100, // Increased padding to avoid overlap with floating tab bar
    gap: 16,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  eventImage: {
    width: 100,
    height: "100%",
    objectFit: "cover",
    backgroundColor: "#eee",
  },
  eventInfo: {
    flex: 1,
    padding: 12,
  },
  eventHeader: {
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
    lineHeight: 22,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  statusRegistered: {
    backgroundColor: "#E6F4EA",
  },
  statusWaitlist: {
    backgroundColor: "#FEF3C7",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1E4620",
    textTransform: "uppercase",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: "#666",
  },
  eventLocation: {
    fontSize: 12,
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f8f8f8",
  },
  ticketType: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
