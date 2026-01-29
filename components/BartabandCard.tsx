import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Layout } from "../constants/Colors";
import { useFavorites } from "../hooks/use-favorites";

interface BartabandCardProps {
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
    capacity: number;
    boyName?: string;
    muhurtaTime?: string;
  };
  containerStyle?: any;
}

const accentColor = "#FF6F00"; // Traditional Saffron
const marigoldColor = "#FFB300"; // Marigold Yellow
const threadColor = "#FFD54F"; // Janai Thread Color

export default function BartabandCard({ event, containerStyle }: BartabandCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const handlePress = () => {
    router.push(`/event/${event.id}`);
  };

  // Format image URL
  const imageUrl = event.coverImage?.startsWith("http")
    ? event.coverImage
    : `${process.env.EXPO_PUBLIC_API_URL}${event.coverImage}`;

  return (
    <TouchableOpacity
      style={[styles.card, styles.bartabandCardContainer, containerStyle]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#FFF3E0', '#FFE0B2', '#FFD180']} // Deep Saffron/Orange base
        style={styles.gradientBg}
      />
      
      {/* Sunburst Watermark Overlay */}
      <View style={styles.sunburstOverlay}>
        <Ionicons name="sunny-outline" size={200} color="rgba(255, 111, 0, 0.05)" style={styles.sunburstIcon} />
      </View>

      {/* Janai (Sacred Thread) Motif */}
      <View style={styles.janaiStrands}>
        <View style={[styles.janaiStrand, { top: 40, opacity: 0.1 }]} />
        <View style={[styles.janaiStrand, { top: 44, opacity: 0.15 }]} />
        <View style={[styles.janaiStrand, { top: 48, opacity: 0.1 }]} />
      </View>

      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
           <Text style={styles.shubhaText}>शुभ व्रतबन्ध</Text>
           <View style={[styles.headerSeparator, { backgroundColor: marigoldColor }]} />
           <Text style={styles.englishHeader}>Sacred Thread Ceremony</Text>
        </View>

        {/* Main Section */}
        <View style={styles.mainRow}>
          {/* Info */}
          <View style={styles.infoSection}>
            <View style={[styles.nameBadge, { backgroundColor: accentColor }]}>
              <Text style={styles.label}>PLEDGING THE PATH</Text>
              <Text style={styles.nameText}>{event.boyName || "Candidate"}</Text>
            </View>
          </View>

          {/* Photo Frame with Marigold Border */}
          <View style={styles.photoSection}>
            <View style={[styles.circularFrame, { borderColor: marigoldColor }]}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                contentFit="cover"
                transition={500}
              />
            </View>
            <View style={[styles.iconBadge, { backgroundColor: marigoldColor }]}>
              <Ionicons name="ribbon" size={14} color="#FFF" />
            </View>
          </View>
        </View>
      </View>

      {/* Footer Bar */}
      <View style={[styles.footer, { backgroundColor: accentColor }]}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={16} color="#FFF" />
          <Text style={styles.footerText}>
            {new Date(event.startDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
        
        {event.muhurtaTime && (
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={16} color="#FFF" />
            <Text style={styles.footerText}>Auspicious: {event.muhurtaTime}</Text>
          </View>
        )}
      </View>

      {/* Favorite Button */}
      <TouchableOpacity 
        style={styles.favoriteBtn} 
        onPress={() => toggleFavorite(event)}
      >
        <Ionicons 
          name={isFavorite(event.id) ? "heart" : "heart-outline"} 
          size={22} 
          color={accentColor} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: Layout.borderRadius.xl,
    marginBottom: Layout.spacing.lg,
    overflow: "hidden",
    ...Layout.shadows.large,
    height: 280,
  },
  bartabandCardContainer: {
    borderWidth: 2,
    borderColor: '#FF6F00',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  sunburstOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  sunburstIcon: {
    opacity: 0.8,
  },
  janaiStrands: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  janaiStrand: {
    position: 'absolute',
    left: -50,
    right: -50,
    height: 1,
    backgroundColor: '#FF6F00',
    transform: [{ rotate: '-15deg' }],
  },
  content: {
    flex: 1,
    padding: 20,
    zIndex: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  shubhaText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#D84315',
    letterSpacing: 1,
  },
  headerSeparator: {
    width: 80,
    height: 3,
    marginVertical: 6,
    borderRadius: 2,
  },
  englishHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3E2723',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoSection: {
    flex: 1.3,
    justifyContent: 'center',
  },
  nameBadge: {
    padding: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  nameText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  photoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circularFrame: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 5,
    padding: 2,
    backgroundColor: '#FFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  iconBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 4,
  },
  footer: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 8,
    borderRadius: 20,
    elevation: 4,
  },
});
