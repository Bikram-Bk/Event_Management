import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Colors, Layout } from "../../constants/Colors";
import {
    useCheckRegistration,
    useRegisterEvent,
} from "../../hooks/use-attendees";
import { useFavorites } from "../../hooks/use-favorites";

const { width, height } = Dimensions.get("window");
const IMG_HEIGHT = 400;

export default function EventDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { toggleFavorite, isFavorite } = useFavorites();
  const API_URL =
    Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

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
      return json.data; // Unwrap the data object
    },
  });

  const { data: registration, isLoading: isCheckingRegistration } =
    useCheckRegistration(id as string);

  const registerMutation = useRegisterEvent();

  const handleRegister = async () => {
    // If user is already registered, do nothing
    if (registration) return;

    // Check if event is free or paid
    // Robust check: Trust price > 0 over isFree flag which might be inconsistent
    const isPaidEvent = (event?.price || 0) > 0;

    if (isPaidEvent) {
      // Navigate to checkout for paid events
      router.push(`/event/checkout/${id}`);
      return;
    }

    // For free events, register immediately
    try {
      await registerMutation.mutateAsync({ eventId: id as string });
      Alert.alert(
        "Success",
        "You have successfully registered for this event! 🎉"
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to register"
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
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={Colors.light.secondary}
        />
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Helper to fix image URLs
  const getFullImageUrl = (path: string | undefined | null) => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
  };

  const coverImage = getFullImageUrl(event.coverImage) || undefined;
  const organizerImage = getFullImageUrl(event.organizer?.avatar) || undefined;

  // Parallax Animations
  const imageScale = scrollY.interpolate({
    inputRange: [-IMG_HEIGHT, 0, IMG_HEIGHT],
    outputRange: [2, 1, 1],
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-IMG_HEIGHT, 0, IMG_HEIGHT],
    outputRange: [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.5],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Parallax Header Image */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            transform: [{ scale: imageScale }, { translateY: imageTranslateY }],
          },
        ]}
      >
        <Image
          source={coverImage ? { uri: coverImage } : undefined}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Floating Header Actions (Back / Share) */}
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.rightActions}>
          <TouchableOpacity 
            style={styles.circleButton} 
            activeOpacity={0.8}
            onPress={() => toggleFavorite(event)}
          >
            <Ionicons 
              name={isFavorite(event.id) ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite(event.id) ? "#FF3B30" : "#FFF"} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleButton} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content ScrollView */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentContainer}>
          {/* Title & Badge */}
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                { backgroundColor: event.category?.color || Colors.light.tint },
              ]}
            >
              <Text style={styles.badgeText}>
                {event.category?.name || "Event"}
              </Text>
            </View>
            <View style={[styles.badge, styles.statusBadge]}>
              <Text style={styles.statusText}>
                {event.status === "PUBLISHED" ? "Upcoming" : event.status}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{event.title}</Text>

          {/* Quick Info Grid */}
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <View style={styles.iconBox}>
                <Ionicons name="calendar" size={20} color={Colors.light.tint} />
              </View>
              <View>
                <Text style={styles.gridLabel}>Date</Text>
                <Text style={styles.gridValue}>
                  {new Date(event.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <View style={styles.iconBox}>
                <Ionicons name="time" size={20} color={Colors.light.tint} />
              </View>
              <View>
                <Text style={styles.gridLabel}>Time</Text>
                <Text style={styles.gridValue}>
                  {new Date(event.startDate).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <View style={styles.iconBox}>
                <Ionicons name="location" size={20} color={Colors.light.tint} />
              </View>
              <View>
                <Text style={styles.gridLabel}>Location</Text>
                <Text style={styles.gridValue} numberOfLines={1}>
                  {event.city || "Online"}
                </Text>
              </View>
            </View>
          </View>

          {/* Organizer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organizer</Text>
            <View style={styles.organizerCard}>
              <Image
                source={
                  organizerImage
                    ? { uri: organizerImage }
                    : { uri: "https://ui-avatars.com/api/?name=Organizer" }
                }
                style={styles.organizerAvatar}
              />
              <View style={styles.organizerInfo}>
                <Text style={styles.organizerName}>
                  {event.organizer?.username || "Event Organizer"}
                </Text>
                <Text style={styles.organizerRole}>Verified Host</Text>
              </View>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followText}>Follow</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Gallery (If exists) */}
          {event.images && event.images.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.galleryScroll}
              >
                {event.images.map((img: string, index: number) => (
                  <Image
                    key={index}
                    source={
                      getFullImageUrl(img)
                        ? { uri: getFullImageUrl(img) }
                        : undefined
                    }
                    style={styles.galleryImage}
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Location Map Placeholder */}
          <View style={[styles.section, { marginBottom: 120 }]}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={32} color={Colors.light.secondary} />
              <Text style={styles.mapText}>
                {event.venueName || event.address || event.city}
              </Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating Action Bar */}
      <View style={styles.actionBar}>
        <View>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceValue}>
            {event.price === 0
              ? "Free"
              : `${event.currency || "NPR"} ${event.price?.toLocaleString()}`}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.bookButton,
            registration ? styles.registeredButton : null,
            registerMutation.isPending || isCheckingRegistration
              ? styles.disabledButton
              : null,
          ]}
          activeOpacity={0.8}
          onPress={registration ? () => {} : handleRegister}
          disabled={
            !!registration ||
            registerMutation.isPending ||
            isCheckingRegistration
          }
        >
          {registerMutation.isPending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.bookText}>
                {registration ? "You are going!" : "Register Now"}
              </Text>
              <Ionicons
                name={registration ? "checkmark-circle" : "arrow-forward"}
                size={20}
                color="#FFF"
              />
            </>
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
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.secondary,
    marginVertical: 12,
    fontWeight: "600",
  },
  errorButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  imageContainer: {
    paddingTop: 0,
    height: IMG_HEIGHT,
    width: "100%",
    position: "absolute",
    top: 0,
    backgroundColor: Colors.light.primary, // Loading bg
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
    height: IMG_HEIGHT,
  },
  headerActions: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  rightActions: {
    flexDirection: "row",
    gap: 12,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)", // Darker glass for better contrast
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  scrollContent: {
    paddingTop: IMG_HEIGHT - 40, // Overlap slightly
  },
  contentContainer: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Layout.spacing.xl,
    minHeight: height,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: Layout.spacing.md,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadge: {
    backgroundColor: "#F1F5F9",
  },
  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  statusText: {
    color: Colors.light.secondary,
    fontWeight: "600",
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: Layout.spacing.xl,
    lineHeight: 34,
  },
  gridContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    padding: 16,
    justifyContent: "space-between",
    marginBottom: Layout.spacing.xl,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  gridItem: {
    flex: 1,
    gap: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  gridLabel: {
    fontSize: 12,
    color: Colors.light.secondary,
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.text,
  },
  section: {
    marginBottom: Layout.spacing.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: Layout.spacing.md,
  },
  organizerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
  },
  organizerRole: {
    fontSize: 12,
    color: Colors.light.secondary,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
  },
  followText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.text,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: "#475569",
  },
  galleryScroll: {
    marginHorizontal: -Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.xl,
  },
  galleryImage: {
    width: 200,
    height: 120,
    borderRadius: 16,
    marginRight: 12,
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  mapText: {
    color: Colors.light.secondary,
    fontWeight: "600",
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    ...Layout.shadows.medium, // Shadow upwards
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.light.secondary,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.light.text,
  },
  bookButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  registeredButton: {
    backgroundColor: "#10B981", // Green for success
  },
  disabledButton: {
    opacity: 0.7,
  },
  bookText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
