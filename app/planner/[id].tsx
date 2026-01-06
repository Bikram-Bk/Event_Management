import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { useEvent, useEventAttendees } from "../../hooks/use-events";
import Constants from "expo-constants";

const AttendeeList = ({ eventId }: { eventId: string }) => {
  const { data: attendees, isLoading, error } = useEventAttendees(eventId);

  if (isLoading) {
    return <ActivityIndicator size="small" color={Colors.light.tint} />;
  }

  if (error) {
    return <Text style={styles.errorText}>Failed to load attendees</Text>;
  }

  if (!attendees || attendees.length === 0) {
    return <Text style={styles.emptyText}>No attendees yet.</Text>;
  }

  return (
    <View style={styles.attendeeList}>
      {attendees.map((attendee: any) => (
        <View key={attendee.id} style={styles.attendeeItem}>
          <Image
            source={{
              uri:
                attendee.user?.avatar ||
                "https://ui-avatars.com/api/?name=" +
                  (attendee.user?.username || "User"),
            }}
            style={styles.attendeeAvatar}
          />
          <View style={styles.attendeeInfo}>
            <Text style={styles.attendeeName}>
              {attendee.user?.username || "Guest"}
            </Text>
            <Text style={styles.attendeeEmail}>{attendee.user?.email}</Text>
          </View>
          <Text style={styles.attendeeStatus}>{attendee.status}</Text>
        </View>
      ))}
    </View>
  );
};

export default function PlannerDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: event, isLoading, error } = useEvent(id as string);

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
        <Text style={styles.errorText}>Failed to load event details</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getFullImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const apiUrl =
      Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
    return `${apiUrl}${path}`;
  };

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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                getFullImageUrl(event.coverImage) ||
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop",
            }}
            style={styles.coverImage}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(event.status) },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusTextColor(event.status) },
              ]}
            >
              {event.status === "DRAFT" ? "Pending Approval" : event.status}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.statsgrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {event._count?.attendees || 0}
              </Text>
              <Text style={styles.statLabel}>Attendees</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{event.viewCount || 0}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {event.isFree
                  ? "Free"
                  : `${event.currency || "NPR"} ${event.price}`}
              </Text>
              <Text style={styles.statLabel}>Price</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Details</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                {new Date(event.startDate).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                {new Date(event.startDate).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                {event.isVirtual
                  ? "Virtual Event"
                  : `${event.location}, ${event.city}`}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attendees</Text>
            <AttendeeList eventId={event.id} />
          </View>

          {/* Admin Feedback Placeholder - To be connected when backend supports it */}
          {event.status === "DRAFT" && (
            <View style={styles.adminNote}>
              <Ionicons name="information-circle" size={20} color="#92400E" />
              <Text style={styles.adminNoteText}>
                Your event is currently pending admin approval. You will be
                notified once it is reviewed.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {event.status === "DRAFT" ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              Alert.alert("Coming Soon", "Edit functionality coming soon")
            }
          >
            <Text style={styles.editButtonText}>Edit Request</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: Colors.light.tint }]}
            onPress={() => {}}
          >
            <Text style={styles.editButtonText}>Manage Attendees</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

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
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    height: 250,
    width: "100%",
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    bottom: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontWeight: "600",
    fontSize: 12,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
  },
  statsgrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.tint,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#4B5563",
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  adminNote: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  adminNoteText: {
    color: "#92400E",
    flex: 1,
    fontSize: 14,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  editButton: {
    backgroundColor: "#4B5563",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  attendeeList: {
    gap: 12,
  },
  attendeeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    gap: 12,
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontWeight: "600",
    color: "#1F2937",
    fontSize: 14,
  },
  attendeeEmail: {
    color: "#6B7280",
    fontSize: 12,
  },
  attendeeStatus: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.light.tint,
  },
  emptyText: {
    color: "#6B7280",
    fontStyle: "italic",
  },
});
