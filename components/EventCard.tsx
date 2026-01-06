import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Layout } from "../constants/Colors";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    coverImage: string;
    startDate: string;
    city?: string;
    isFree: boolean;
    price?: number;
    currency?: string;
    category: {
      name: string;
      icon: string;
      color: string;
    };
    organizer?: {
      username: string;
      avatar?: string;
    };
    _count?: {
      attendees: number;
    };
  };
}

export default function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  const handlePress = () => {
    router.push(`/event/${event.id}`);
  };

  // Format image URL
  const imageUrl = event.coverImage?.startsWith("http")
    ? event.coverImage
    : `${process.env.EXPO_PUBLIC_API_URL}${event.coverImage}`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
        />
      </View>

      {/* Top Badges */}
      <View style={styles.topBadges}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {event.category?.name || "Event"}
          </Text>
        </View>
        <View
          style={[
            styles.priceBadge,
            (Number(event.price) || 0) > 0 && styles.paidBadge,
          ]}
        >
          <Text style={styles.priceText}>
            {Number(event.price) === 0
              ? "Free"
              : `${event.currency || "NPR"} ${Number(event.price)?.toFixed(0)}`}
          </Text>
        </View>
      </View>

      {/* Content Overlay */}
      <View style={styles.content}>
        <Text style={styles.date}>
          {formatDate(event.startDate).toUpperCase()}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#CCCCCC" />
            <Text style={styles.infoText}>{event.city || "Virtual"}</Text>
          </View>
          {event.organizer && (
            <View style={styles.organizerRow}>
              <Ionicons name="person-outline" size={14} color="#CCCCCC" />
              <Text style={styles.infoText} numberOfLines={1}>
                {event.organizer.username}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: Layout.borderRadius.xl,
    marginBottom: Layout.spacing.lg,
    overflow: "hidden",
    ...Layout.shadows.large,
    height: 320,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%", // Full gradient for better text visibility
    zIndex: 1,
  },
  topBadges: {
    position: "absolute",
    top: Layout.spacing.md,
    left: Layout.spacing.md,
    right: Layout.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },
  categoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Frosted glass feel
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs + 2,
    borderRadius: 20,
    // backdropFilter: 'blur(10px)', // Note: backdropFilter not supported on RN mobile natively without extra libs, relying on opacity
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.text,
    letterSpacing: 0.5,
  },
  priceBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  paidBadge: {
    backgroundColor: Colors.light.tint, // Gold/Bronze
    borderWidth: 0,
  },
  priceText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Layout.spacing.lg,
    zIndex: 2,
  },
  date: {
    color: Colors.light.accent,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: Layout.spacing.xs,
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: Layout.spacing.sm,
    lineHeight: 30,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  infoText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "500",
  },
});
