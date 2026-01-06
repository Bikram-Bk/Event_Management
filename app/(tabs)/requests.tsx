import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Constants from "expo-constants";
import { Colors } from "../../constants/Colors";
import { useMyRequests } from "../../hooks/use-events";

export default function RequestsTab() {
  const router = useRouter();
  const { data: myRequests, isLoading, refetch } = useMyRequests();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "published">(
    "published"
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  const allRequests = myRequests || [];

  // Filter requests based on status
  // Filter requests based on status
  const requests = allRequests.filter((req: any) => {
    if (activeTab === "pending") {
      return req.status === "DRAFT" || req.status === "CANCELLED"; // Group Draft and Cancelled
    } else {
      return req.status === "PUBLISHED" || req.status === "COMPLETED"; // Group Published and Completed
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "#E6F4EA";
      case "DRAFT":
        return "#FEF3C7";
      case "CANCELLED":
        return "#FFE5E5";
      case "COMPLETED":
        return "#E0F2FE";
      default:
        return "#F3F4F6";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "#1E4620";
      case "DRAFT":
        return "#92400E";
      case "CANCELLED":
        return "#991B1B";
      case "COMPLETED":
        return "#0369A1";
      default:
        return "#374151";
    }
  };

  const getFullImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const apiUrl =
      Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
    return `${apiUrl}${path}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Created Events</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "published" && styles.activeTab]}
          onPress={() => setActiveTab("published")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "published" && styles.activeTabText,
            ]}
          >
            Published
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pending" && styles.activeTabText,
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.tint]}
          />
        }
      >
        {requests.length > 0 ? (
          requests.map((request: any) => (
            <TouchableOpacity
              key={request.id}
              style={styles.card}
              onPress={() => {
                router.push(`/planner/${request.id}`);
              }}
            >
              <Image
                source={{
                  uri:
                    getFullImageUrl(request.coverImage) ||
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop",
                }}
                style={styles.cardImage}
              />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {request.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(request.status) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusTextColor(request.status) },
                      ]}
                    >
                      {request.status === "DRAFT" ? "Pending" : request.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardDate}>
                  {new Date(request.startDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>

                <Text style={styles.cardDescription} numberOfLines={1}>
                  {request.description}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Ionicons name="people" size={14} color="#666" />
                      <Text style={styles.statText}>
                        {request._count?.attendees || 0} Joined
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.priceText}>
                    {request.isFree
                      ? "Free"
                      : `${request.currency || "NPR"} ${request.price}`}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>
              No {activeTab === "published" ? "Published" : "Pending"} Events
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === "pending"
                ? "You don't have any pending requests."
                : "You don't have any published events."}
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/create-event")}
            >
              <Text style={styles.createButtonText}>Request Event</Text>
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
    paddingTop: 60,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: "row",
    height: 140, // Fixed height for consistency
  },
  cardImage: {
    width: 100,
    height: "100%",
    backgroundColor: "#eee",
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  cardDate: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#6B7280",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  activeTab: {
    backgroundColor: Colors.light.tint,
  },
  tabText: {
    fontWeight: "600",
    color: "#4B5563",
  },
  activeTabText: {
    color: "#fff",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
