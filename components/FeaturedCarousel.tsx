import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef } from "react";
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors, Layout } from "../constants/Colors";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.85;
const SPACING = Layout.spacing.md;

interface FeaturedCarouselProps {
  events: any[]; // Using any for simplicity in rapid dev, ideally proper type
}

export default function FeaturedCarousel({ events }: FeaturedCarouselProps) {
  const { actualTheme } = useTheme();
  const colors = Colors[actualTheme];
  const scrollX = useRef(new Animated.Value(0)).current;

  if (!events || events.length === 0) return null;

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const inputRange = [
      (index - 1) * (ITEM_WIDTH + SPACING),
      index * (ITEM_WIDTH + SPACING),
      (index + 1) * (ITEM_WIDTH + SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.92, 1, 0.92],
    });

    const imageUrl = item.coverImage?.startsWith("http")
      ? item.coverImage
      : `${process.env.EXPO_PUBLIC_API_URL}${item.coverImage}`;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/event/${item.id}`)}
      >
        <Animated.View
          style={[styles.itemContainer, { transform: [{ scale }], backgroundColor: colors.card }]}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.9)"]}
            style={styles.gradient}
          />

          <View style={styles.content}>
            <View style={[styles.badge, { backgroundColor: colors.tint }]}>
              <Text style={styles.badgeText}>FEATURED</Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.date}>
              {new Date(item.startDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Layout.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: (width - ITEM_WIDTH) / 2 - SPACING,
    paddingBottom: Layout.spacing.lg, // Space for shadow
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: 400,
    borderRadius: Layout.borderRadius.xl,
    overflow: "hidden",
    backgroundColor: '#fff',
    marginHorizontal: SPACING / 2,
    ...Layout.shadows.large,
    shadowOpacity: 0.25, // Stronger shadow for featured
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
    height: "100%",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Layout.spacing.xl,
  },
  badge: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: Layout.spacing.sm,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: Layout.spacing.xs,
    lineHeight: 34,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  date: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    fontWeight: "500",
  },
});
