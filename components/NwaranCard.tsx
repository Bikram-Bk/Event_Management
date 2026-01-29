import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Layout } from "../constants/Colors";
import { useFavorites } from "../hooks/use-favorites";

interface NwaranCardProps {
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

const accentColor = "#FFC107"; // Turmeric Yellow
const pureWhite = "#FFFFFF";
const tikkaRed = "#D32F2F"; // Tikka Red

export default function NwaranCard({ event, containerStyle }: NwaranCardProps) {
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
      style={[styles.card, styles.nwaranCardContainer, containerStyle]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#FFFDE7', '#FFF9C4', '#FFF176']} // Bright Turmeric Yellow base
        style={styles.gradientBg}
      />
      
      {/* Diyo Watermark Overlay */}
      <View style={styles.diyoOverlay}>
        <Ionicons name="sunny" size={200} color="rgba(255, 193, 7, 0.08)" style={styles.diyoIcon} />
      </View>

      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
           <Text style={styles.shubhaText}>शुभ न्वारन</Text>
           <View style={[styles.headerSeparator, { backgroundColor: tikkaRed }]} />
           <Text style={styles.englishHeader}>Naming Ceremony</Text>
        </View>

        {/* Main Section */}
        <View style={styles.mainRow}>
          {/* Info */}
          <View style={styles.infoSection}>
            <View style={[styles.nameBadge, { backgroundColor: pureWhite, borderColor: accentColor, borderWidth: 2 }]}>
              <Text style={[styles.label, { color: '#757575' }]}>A NEW NAME, A NEW LIFE</Text>
              <Text style={[styles.nameText, { color: '#FB8C00' }]}>{event.babyName || "Newborn"}</Text>
            </View>
            
            <View style={styles.genderRow}>
              <View style={[styles.tikka, { backgroundColor: tikkaRed }]} />
              <Text style={[styles.genderText, { color: tikkaRed }]}>
                {event.babyGender || "Special Blessing"}
              </Text>
            </View>
          </View>

          {/* Photo Frame with Sunburst Border */}
          <View style={styles.photoSection}>
            <View style={[styles.circularFrame, { borderColor: accentColor }]}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                contentFit="cover"
                transition={500}
              />
            </View>
            <View style={[styles.iconBadge, { backgroundColor: tikkaRed }]}>
              <Ionicons name="sunny" size={14} color="#FFF" />
            </View>
          </View>
        </View>
      </View>

      {/* Footer Bar */}
      <View style={[styles.footer, { backgroundColor: accentColor }]}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={16} color="#3E2723" />
          <Text style={styles.footerText}>
            {new Date(event.startDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
        
        {event.muhurtaTime && (
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={16} color="#3E2723" />
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
          color={tikkaRed} 
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
  nwaranCardContainer: {
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  diyoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  diyoIcon: {
    opacity: 0.6,
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
    color: '#FB8C00',
    letterSpacing: 1.5,
  },
  headerSeparator: {
    width: 60,
    height: 4,
    marginVertical: 4,
    borderRadius: 2,
  },
  englishHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5D4037',
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
    elevation: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '900',
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingLeft: 8,
  },
  tikka: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  genderText: {
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
    borderWidth: 5,
    padding: 2,
    backgroundColor: '#FFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 3,
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
    color: '#3E2723',
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
