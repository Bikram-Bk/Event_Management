import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Layout } from "../constants/Colors";
import { useFavorites } from "../hooks/use-favorites";

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
    capacity: number;
    brideName?: string;
    groomName?: string;
  };
  containerStyle?: any;
}

const accentColor = "#B71C1C"; // Deeper Crimson
const goldColor = "#D4AF37"; // Authentic Gold

export default function WeddingCard({ event, containerStyle }: EventCardProps) {
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
      style={[styles.card, styles.authenticWeddingCard, containerStyle]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#FFF5F5', '#FFEBEE', '#FFDADA']} // Soft Red/Pinkish-Cream background
        style={styles.weddingGradientBg}
      />
      
      {/* Dhaka Pattern Overlay (Simulated with repeating views) */}
      <View style={styles.dhakaOverlay}>
        {[...Array(6)].map((_, i) => (
          <View key={i} style={styles.dhakaRow}>
            {[...Array(12)].map((_, j) => (
              <View 
                key={j} 
                style={[
                  styles.dhakaDiamond, 
                  { backgroundColor: (i + j) % 2 === 0 ? 'rgba(183, 28, 28, 0.05)' : 'rgba(212, 175, 55, 0.05)' }
                ]} 
              />
            ))}
          </View>
        ))}
      </View>

      {/* Marigold Garland Border */}
      <View style={styles.garlandTop}>
        {[...Array(20)].map((_, i) => (
          <View key={i} style={[styles.marigold, { backgroundColor: i % 2 === 0 ? '#FFB300' : '#FB8C00' }]} />
        ))}
      </View>
      
      <View style={styles.weddingContent}>
        {/* Authentic Shubha Vivaha Header */}
        <View style={styles.authenticHeaderContainer}>
            <View style={styles.shubhaTextWrapper}>
              <Text style={styles.shubhaTextAuthentic}>शुभ-विवाह</Text>
              <View style={[styles.shubhaTail, { backgroundColor: accentColor }]} />
            </View>
            {/* Ganesh Icon (Top Right) */}
            <View style={styles.ganeshIconContainer}>
               <Text style={{ fontSize: 20 }}>🕉️</Text>
            </View>
        </View>

        {/* Main Body */}
        <View style={styles.weddingMainBody}>
          {/* Left Section: Name Motif */}
          <View style={styles.authenticLeftSection}>
            <View style={styles.authenticMotifContainer}>
              {/* Names and Evam Heart */}
              <View style={styles.namesColumn}>
                <Text style={styles.authenticBrideName}>{event.brideName}</Text>
                
                <View style={styles.evamHeartContainer}>
                  <Ionicons name="heart" size={44} color={accentColor} />
                  <Text style={styles.evamHeartText}>समक्ष</Text>
                  {/* Rose on Top of Heart */}
                  <Ionicons name="rose" size={24} color="#FF0000" style={styles.roseIcon} />
                </View>

                <Text style={styles.authenticGroomName}>{event.groomName}</Text>
              </View>
            </View>
          </View>

          {/* Right Section: Ornate Photo Frame */}
          <View style={styles.authenticRightSection}>
            <View style={styles.photoFrameWrapper}>
              <View style={[styles.photoFrame, { borderColor: goldColor }]}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.authenticImage}
                    contentFit="cover"
                    transition={500}
                  />
              </View>
              {/* Corner Ornaments */}
              <Ionicons name="leaf" size={20} color={goldColor} style={styles.cornerOrnamentTL} />
              <Ionicons name="leaf" size={20} color={goldColor} style={styles.cornerOrnamentBR} />
            </View>
          </View>
        </View>
      </View>

      {/* Authentic Red Bottom Bar */}
      <View style={[styles.authenticBottomBar, { backgroundColor: accentColor }]}>
        <View style={styles.kalashContainer}>
          <Text style={{ fontSize: 18 }}>🏺</Text>
          <View style={[styles.omCircle, { backgroundColor: goldColor }]}>
            <Text style={[styles.omTextSmall, { color: accentColor }]}>ॐ</Text>
          </View>
        </View>
        
        <Text style={styles.authenticDateText}>
           {new Date(event.startDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>

        <View style={styles.kalashContainer}>
          <View style={[styles.omCircle, { backgroundColor: goldColor }]}>
            <Text style={[styles.omTextSmall, { color: accentColor }]}>ॐ</Text>
          </View>
          <Text style={{ fontSize: 18 }}>🏺</Text>
        </View>
      </View>

      {/* Favorite Button */}
      <TouchableOpacity 
        style={styles.authenticFavoriteBtn} 
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
    height: 320,
  },
  authenticWeddingCard: {
    height: 320,
    backgroundColor: '#FFFDE7',
    borderRightWidth: 8,
    borderRightColor: '#B71C1C',
    borderLeftWidth: 8, 
    borderLeftColor: '#B71C1C',
    borderRadius: Layout.borderRadius.xl,
    marginBottom: Layout.spacing.lg,
    overflow: "hidden",
  },
  weddingGradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  dhakaOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
    zIndex: 1,
  },
  dhakaRow: {
    flexDirection: 'row',
  },
  dhakaDiamond: {
    width: 30,
    height: 30,
    transform: [{ rotate: '45deg' }],
    margin: 5,
  },
  garlandTop: {
    position: 'absolute',
    top: -5,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 10,
  },
  marigold: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginHorizontal: -2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  weddingContent: {
    flex: 1,
    padding: 15,
    zIndex: 5,
  },
  authenticHeaderContainer: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  shubhaTextWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  shubhaTextAuthentic: {
    fontSize: 36, 
    fontWeight: '900',
    color: '#B71C1C',
    letterSpacing: 2,
    zIndex: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  shubhaTail: {
    position: 'absolute',
    bottom: 2,
    width: '110%',
    height: 3,
    borderRadius: 2,
    zIndex: 0,
  },
  ganeshIconContainer: {
    position: 'absolute',
    top: -10,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  weddingMainBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center', 
  },
  authenticLeftSection: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authenticRightSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authenticMotifContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  namesColumn: {
    alignItems: 'center',
  },
  authenticBrideName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#B71C1C', 
    textTransform: 'uppercase',
  },
  authenticGroomName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#B71C1C',
    textTransform: 'uppercase',
  },
  evamHeartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  evamHeartText: {
    position: 'absolute',
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  roseIcon: {
    position: 'absolute',
    top: -15,
    zIndex: 20,
  },
  photoFrameWrapper: {
    width: 130,
    height: 130,
    position: 'relative',
  },
  photoFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 65,
    borderWidth: 5,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  authenticImage: {
    width: '100%',
    height: '100%',
  },
  cornerOrnamentTL: {
    position: 'absolute',
    top: -5,
    left: -5,
    transform: [{ rotate: '-45deg' }],
  },
  cornerOrnamentBR: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    transform: [{ rotate: '135deg' }],
  },
  authenticBottomBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderTopWidth: 2,
    borderTopColor: '#D4AF37',
  },
  kalashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  omCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  omTextSmall: {
    fontSize: 12,
    fontWeight: '900',
  },
  authenticDateText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  authenticFavoriteBtn: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
