import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Layout } from "../constants/Colors";
import { useFavorites } from "../hooks/use-favorites";

interface PasniCardProps {
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
    babyName?: string;
    babyGender?: string;
    muhurtaTime?: string;
  };
  containerStyle?: any;
}

const accentColor = "#D32F2F"; // Auspicious Red
const silverColor = "#E0E0E0"; // Traditional Silver
const goldColor = "#FFB300"; // Marigold Yellow

export default function PasniCard({ event, containerStyle }: PasniCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const handlePress = () => {
    router.push(`/event/${event.id}`);
  };

  // Format image URL
  const imageUrl = event.coverImage?.startsWith("http")
    ? event.coverImage
    : `${process.env.EXPO_PUBLIC_API_URL}${event.coverImage}`;

  const isGirl = event.babyGender?.toLowerCase() === 'girl';
  const babyAccent = isGirl ? '#E91E63' : '#1976D2';

  return (
    <TouchableOpacity
      style={[styles.card, styles.pasniCardContainer, containerStyle]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#E3F2FD', '#E1F5FE', '#B3E5FC']} // Soft Icy Blue base
        style={styles.pasniGradientBg}
      />
      
      {/* Mandala Watermark Overlay */}
      <View style={styles.mandalaOverlay}>
        <Ionicons name="flower-outline" size={240} color="rgba(25, 118, 210, 0.05)" style={styles.mandalaIcon} />
      </View>

      <View style={styles.pasniContent}>
        {/* Header Section */}
        <View style={styles.pasniHeader}>
           <Text style={styles.shubhaText}>शुभ पास्नी</Text>
           <View style={[styles.headerSeparator, { backgroundColor: goldColor }]} />
           <Text style={styles.englishHeader}>Rice Feeding Ceremony</Text>
        </View>

        {/* Main Section */}
        <View style={styles.pasniMainRow}>
          {/* Baby Info */}
          <View style={styles.infoSection}>
            <View style={[styles.nameBadge, { backgroundColor: babyAccent }]}>
              <Text style={styles.babyLabel}>Blessings to our</Text>
              <Text style={styles.babyNameText}>{event.babyName || "Little One"}</Text>
            </View>
            
            <View style={styles.genderRow}>
              <Ionicons 
                name={isGirl ? "female" : "male"} 
                size={18} 
                color={babyAccent} 
              />
              <Text style={[styles.genderText, { color: babyAccent }]}>
                {event.babyGender || "Special Delivery"}
              </Text>
            </View>
          </View>

          {/* Photo Frame with Silver Border */}
          <View style={styles.photoSection}>
            <View style={[styles.circularFrame, { borderColor: silverColor }]}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.babyImage}
                contentFit="cover"
                transition={500}
              />
            </View>
            {/* Small icon overlay: Silver Spoon/Bowl representer */}
            <View style={[styles.iconBadge, { backgroundColor: silverColor }]}>
              <Ionicons name="restaurant" size={14} color={accentColor} />
            </View>
          </View>
        </View>
      </View>

      {/* Footer Bar */}
      <View style={[styles.pasniFooter, { backgroundColor: accentColor }]}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={16} color="#FFF" />
          <Text style={styles.footerText}>
            {new Date(event.startDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
        
        {event.muhurtaTime && (
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={16} color="#FFF" />
            <Text style={styles.footerText}>Muhurta: {event.muhurtaTime}</Text>
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
  pasniCardContainer: {
    borderWidth: 2,
    borderColor: '#D32F2F',
  },
  pasniGradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  mandalaOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  mandalaIcon: {
    opacity: 0.5,
  },
  pasniContent: {
    flex: 1,
    padding: 20,
    zIndex: 5,
  },
  pasniHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  shubhaText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#D32F2F',
    letterSpacing: 1.5,
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
    color: '#5D4037',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pasniMainRow: {
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
  babyLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  babyNameText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingLeft: 8,
  },
  genderText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '800',
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
    borderWidth: 6,
    padding: 2,
    backgroundColor: '#FFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  babyImage: {
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
  pasniFooter: {
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
