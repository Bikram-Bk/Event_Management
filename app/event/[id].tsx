import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useRef } from "react";
import {
    ActivityIndicator,
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
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import {
    useCheckRegistration,
    useRegisterEvent,
} from "../../hooks/use-attendees";
import { useFavorites } from "../../hooks/use-favorites";
import { useGetUser } from "../../hooks/use-get-user";

const { width, height } = Dimensions.get("window");
const IMG_HEIGHT = 400;

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
  errorText: {
    fontSize: 18,
    marginVertical: 12,
    fontWeight: "600",
  },
  errorButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  imageContainer: {
    height: IMG_HEIGHT,
    width: "100%",
    position: "absolute",
    top: 0,
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
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  scrollContent: {
    paddingTop: IMG_HEIGHT - 40,
  },
  contentContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Layout.spacing.xl,
    minHeight: height,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
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
    fontWeight: "600",
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: Layout.spacing.xl,
    lineHeight: 34,
  },
  gridContainer: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 16,
    justifyContent: "space-between",
    marginBottom: Layout.spacing.xl,
    borderWidth: 1,
  },
  gridItem: {
    flex: 1,
    gap: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  gridLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  section: {
    marginBottom: Layout.spacing.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: Layout.spacing.md,
  },
  organizerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
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
  },
  organizerRole: {
    fontSize: 12,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followText: {
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
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
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  mapText: {
    fontWeight: "600",
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  priceLabel: {
    fontSize: 12,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  bookButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  registeredButton: {
    backgroundColor: "#10B981",
  },
  disabledButton: {
    opacity: 0.7,
  },
  bookText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  downloadTicketButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 16,
  },
  downloadIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  downloadSub: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default function EventDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { actualTheme } = useTheme();
  const colors = Colors[actualTheme];
  const scrollY = useRef(new Animated.Value(0)).current;
  const { toggleFavorite, isFavorite } = useFavorites();
  const { showToast } = useToast();
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

  const { data: registration, isLoading: isCheckingRegistration } = useCheckRegistration(id as string);
  const registerMutation = useRegisterEvent();
  const { data: userData } = useGetUser();
 
  const handleDownloadTicket = async () => {
    if (!registration || !event) return;
    
    const attendeeName = userData?.data?.username || userData?.data?.name || registration.guestName || 'Verified Attendee';
    const isFree = event.price === 0 || !event.price;
    const price = Number(event.price) || 0;
    const quantity = registration.ticketCount || 1;
    const total = registration.paymentAmount ? Number(registration.paymentAmount) : (price * quantity);
    const currency = event.currency || 'NPR';
    const transactionRef = registration.transactionId || registration.pidx || registration.id.toUpperCase();
    
    const html = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
            
            /* Ticket Section */
            .ticket { padding: 40px; position: relative; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
            .logo { font-size: 20px; font-weight: 900; color: #6366f1; letter-spacing: -0.5px; margin-bottom: 8px; text-transform: uppercase; }
            .title { font-size: 28px; font-weight: 800; margin: 0; color: #0f172a; line-height: 1.2; }
            
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 10px; }
            .info-item { margin-bottom: 4px; }
            .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px; }
            .value { font-size: 15px; font-weight: 600; color: #1e293b; }
            
            /* Perforation Line */
            .perforation { border-top: 2px dashed #cbd5e1; position: relative; margin: 0 20px; }
            .perforation::before, .perforation::after { content: ''; position: absolute; top: -10px; width: 20px; height: 20px; background-color: #f8fafc; border-radius: 50%; border: 1px solid #e2e8f0; }
            .perforation::before { left: -31px; }
            .perforation::after { right: -31px; }

            /* Receipt Section */
            .receipt { padding: 30px 40px; background-color: #fafafa; }
            .receipt-title { font-size: 14px; font-weight: 800; text-transform: uppercase; margin-bottom: 16px; color: #475569; display: flex; justify-content: space-between; }
            
            .receipt-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
            .receipt-row.total { margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 18px; font-weight: 800; color: #6366f1; }
            
            .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #e0f2fe; color: #0369a1; font-weight: 700; font-size: 11px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="ticket">
              <div class="header">
                <div class="logo">EVENT<span style="color: #64748b">LY</span></div>
                <h2 class="title">${event.title}</h2>
              </div>
              
              <div class="info-grid">
                <div class="info-item">
                  <p class="label">Date & Time</p>
                  <p class="value">${new Date(event.startDate).toLocaleDateString()} at ${new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div class="info-item">
                  <p class="label">Location</p>
                  <p class="value">${event.venueName || event.city || 'Online'}</p>
                </div>
                <div class="info-item">
                  <p class="label">Attendee</p>
                  <p class="value">${attendeeName}</p>
                </div>
                <div class="info-item">
                  <p class="label">Pass Status</p>
                  <p class="badge">${isFree ? 'Free Entry' : 'Paid Admission'}</p>
                </div>
              </div>
            </div>

            <div class="perforation"></div>

            <div class="receipt">
              <div class="receipt-title">
                <span>Order Summary</span>
                <span style="font-size: 10px; color: #94a3b8">#${registration.id.slice(-8).toUpperCase()}</span>
              </div>
              
              <div class="receipt-row">
                <span>Ticket Breakdown</span>
                <span>${quantity}x ${registration.ticketType || 'General'}</span>
              </div>
              
              <div class="receipt-row" style="color: #64748b">
                <span>Unit Price</span>
                <span>${currency} ${price.toLocaleString()}</span>
              </div>

              ${!isFree ? `
              <div class="receipt-row" style="color: #64748b">
                <span>Payment Method</span>
                <span>Digital Wallet</span>
              </div>
              <div class="receipt-row" style="color: #64748b">
                <span>Transaction Ref</span>
                <span style="font-family: monospace;">${transactionRef}</span>
              </div>
              ` : ''}

              <div class="receipt-row total">
                <span>Total Amount</span>
                <span>${currency} ${total.toLocaleString()}</span>
              </div>

              <div class="footer">
                <p>Purchased on ${new Date(registration.registeredAt || Date.now()).toLocaleDateString()}</p>
                <p>This is a digital pass. Please present it at the gate for validation.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast({ message: "Failed to generate ticket PDF", type: "error" });
    }
  };

  const actionTextColor = actualTheme === 'dark' ? colors.background : '#FFF';

  const handleRegister = async () => {
    if (registration) return;
    const isPaidEvent = (event?.price || 0) > 0;
    if (isPaidEvent) {
      router.push(`/event/checkout/${id}`);
      return;
    }
    try {
      await registerMutation.mutateAsync({ eventId: id as string });
      showToast({ message: "You have successfully registered for this event! 🎉", type: "success" });
    } catch (error) {
      showToast({ 
        message: error instanceof Error ? error.message : "Failed to register", 
        type: "error" 
      });
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
        <Ionicons name="alert-circle-outline" size={48} color={colors.secondary} />
        <Text style={[styles.errorText, { color: colors.secondary }]}>Event not found</Text>
        <TouchableOpacity
          style={[styles.errorButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
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
  const organizerImage = getFullImageUrl(event.organizer?.avatar);

  const imageScale = scrollY.interpolate({
    inputRange: [-IMG_HEIGHT, 0, IMG_HEIGHT],
    outputRange: [2, 1, 1],
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-IMG_HEIGHT, 0, IMG_HEIGHT],
    outputRange: [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.5],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={[styles.imageContainer, { transform: [{ scale: imageScale }, { translateY: imageTranslateY }], backgroundColor: colors.primary }]}>
        <Image
          source={coverImage ? { uri: coverImage } : undefined}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]} style={styles.gradient} />
      </Animated.View>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.circleButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.circleButton} activeOpacity={0.8} onPress={() => toggleFavorite(event)}>
            <Ionicons name={isFavorite(event.id) ? "heart" : "heart-outline"} size={24} color={isFavorite(event.id) ? "#FF3B30" : "#FFF"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleButton} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: event.category?.color || colors.tint }]}>
              <Text style={styles.badgeText}>{event.category?.name || "Event"}</Text>
            </View>
            <View style={[styles.badge, styles.statusBadge, { backgroundColor: actualTheme === 'dark' ? colors.card : '#F1F5F9' }]}>
              <Text style={[styles.statusText, { color: colors.secondary }]}>{event.status === "PUBLISHED" ? "Upcoming" : event.status}</Text>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text>

          <View style={[styles.gridContainer, { backgroundColor: actualTheme === 'dark' ? colors.card : '#F8F9FA', borderColor: colors.border }]}>
            <View style={styles.gridItem}>
              <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                <Ionicons name="calendar" size={20} color={colors.tint} />
              </View>
              <View>
                <Text style={[styles.gridLabel, { color: colors.secondary }]}>Date</Text>
                <Text style={[styles.gridValue, { color: colors.text }]}>
                  {new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}
                </Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                <Ionicons name="time" size={20} color={colors.tint} />
              </View>
              <View>
                <Text style={[styles.gridLabel, { color: colors.secondary }]}>Time</Text>
                <Text style={[styles.gridValue, { color: colors.text }]}>
                  {new Date(event.startDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                <Ionicons name="location" size={20} color={colors.tint} />
              </View>
              <View>
                <Text style={[styles.gridLabel, { color: colors.secondary }]}>Location</Text>
                <Text style={[styles.gridValue, { color: colors.text }]}>{event.city || "Online"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Organizer</Text>
            <View style={[styles.organizerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image source={organizerImage ? { uri: organizerImage } : { uri: "https://ui-avatars.com/api/?name=Organizer" }} style={styles.organizerAvatar} />
              <View style={styles.organizerInfo}>
                <Text style={[styles.organizerName, { color: colors.text }]}>{event.organizer?.username || "Event Organizer"}</Text>
                <Text style={[styles.organizerRole, { color: colors.secondary }]}>Verified Host</Text>
              </View>
              <TouchableOpacity style={[styles.followButton, { backgroundColor: actualTheme === 'dark' ? colors.border : '#F1F5F9' }]}>
                <Text style={[styles.followText, { color: colors.text }]}>Follow</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About this Event</Text>
            <Text style={[styles.description, { color: colors.text, opacity: 0.8 }]}>{event.description}</Text>
          </View>

          {event.images && event.images.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Gallery</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                {event.images.map((img: string, index: number) => (
                  <Image key={index} source={getFullImageUrl(img) ? { uri: getFullImageUrl(img) } : undefined} style={styles.galleryImage} contentFit="cover" />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={[styles.section, { marginBottom: 120 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
            <View style={[styles.mapPlaceholder, { backgroundColor: actualTheme === 'dark' ? colors.card : '#F1F5F9' }]}>
              <Ionicons name="map" size={32} color={colors.secondary} />
              <Text style={[styles.mapText, { color: colors.secondary }]}>{event.venueName || event.address || event.city}</Text>
            </View>

            {registration && (registration.paymentStatus === 'COMPLETED' || event.price === 0) && (
              <TouchableOpacity
                style={[
                  styles.downloadTicketButton,
                  { 
                    backgroundColor: colors.tint + '10',
                    borderColor: colors.tint,
                    marginTop: 24
                  }
                ]}
                onPress={handleDownloadTicket}
              >
                <View style={[styles.downloadIconBox, { backgroundColor: colors.tint }]}>
                    <Ionicons name="download" size={20} color="#FFF" />
                </View>
                <View>
                    <Text style={[styles.downloadTitle, { color: colors.text }]}>Download Ticket</Text>
                    <Text style={[styles.downloadSub, { color: colors.secondary }]}>Save your confirmation for entry</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      <View style={[styles.actionBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View>
          <Text style={[styles.priceLabel, { color: colors.secondary }]}>Total Price</Text>
          <Text style={[styles.priceValue, { color: colors.text }]}>
            {event.price === 0 ? "Free" : `${event.currency || "NPR"} ${event.price?.toLocaleString()}`}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary, shadowColor: colors.primary }, registration ? styles.registeredButton : null, registerMutation.isPending || isCheckingRegistration ? styles.disabledButton : null]}
          activeOpacity={0.8}
          onPress={registration ? () => {} : handleRegister}
          disabled={!!registration || registerMutation.isPending || isCheckingRegistration}
        >
          {registerMutation.isPending ? (<ActivityIndicator color={actionTextColor} size="small" />) : (
            <>
              <Text style={[styles.bookText, { color: actionTextColor }]}>{registration ? "You are going!" : "Register Now"}</Text>
              <Ionicons name={registration ? "checkmark-circle" : "arrow-forward"} size={20} color={actionTextColor} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
