import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ChatButton from "../../components/ChatButton";
import ChatModal from "../../components/ChatModal";
import EventCard from "../../components/EventCard";
import FeaturedCarousel from "../../components/FeaturedCarousel";
import { Colors, Layout } from "../../constants/Colors";
import { useTheme } from "../../context/ThemeContext";
import { useCategories } from "../../hooks/use-categories";
import { useEvents } from "../../hooks/use-events";
import { useGetUser } from "../../hooks/use-get-user";

export default function DiscoverScreen() {
  const router = useRouter();
  const { actualTheme } = useTheme();
  const colors = Colors[actualTheme];
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [refreshing, setRefreshing] = useState(false);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    isFree: undefined as boolean | undefined,
    isVirtual: undefined as boolean | undefined,
  });
  const [isChatVisible, setIsChatVisible] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: userData } = useGetUser();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  const {
    data: eventsData,
    isLoading: eventsLoading,
    refetch,
  } = useEvents({
    categoryId: selectedCategory,
    status: "PUBLISHED",
    search: debouncedSearch,
    city: filters.city || undefined,
    isFree: filters.isFree,
    isVirtual: filters.isVirtual,
    limit: 50,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(
      selectedCategory === categoryId ? undefined : categoryId,
    );
  };

  const resetFilters = () => {
    setFilters({
      city: "",
      isFree: undefined,
      isVirtual: undefined,
    });
    setSearchQuery("");
  };

  const user = userData?.data;
  const events = eventsData?.data || [];
  const featuredEvents = events.slice(0, 3);

  // Show all results if any filter or search is active, otherwise slice to account for Featured section
  const isFiltering = !!(
    selectedCategory ||
    debouncedSearch ||
    filters.city ||
    filters.isFree !== undefined ||
    filters.isVirtual !== undefined
  );
  const listEvents = isFiltering ? events : events.slice(3);

  console.log(
    `[DiscoverScreen] Events loaded: ${events.length}, Filtering: ${isFiltering}`,
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getFullImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const apiUrl =
      Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
    return `${apiUrl}${path}`;
  };

  const isLoadingInitial = eventsLoading && !eventsData;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={actualTheme === "dark" ? "light-content" : "dark-content"}
      />

      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image
                source={{ uri: getFullImageUrl(user.avatar) || undefined }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: colors.border },
                ]}
              >
                <Ionicons name="person" size={20} color={colors.tint} />
              </View>
            )}
          </View>
          <View>
            <Text style={[styles.greetingText, { color: colors.secondary }]}>
              {getGreeting()},
            </Text>
            <Text
              style={[styles.userNameText, { color: colors.text }]}
              numberOfLines={1}
            >
              {user?.username || "Guest"}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={[
              styles.notificationButton,
              {
                backgroundColor: actualTheme === "dark" ? colors.card : "#fff",
              },
            ]}
            onPress={() => router.push("/create-event")}
          >
            <Ionicons name="add" size={24} color={colors.tint} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.notificationButton,
              {
                backgroundColor: actualTheme === "dark" ? colors.card : "#fff",
              },
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.text}
            />
            <View
              style={[
                styles.badge,
                { borderColor: actualTheme === "dark" ? colors.card : "#fff" },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: actualTheme === "dark" ? colors.card : "#fff" },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.secondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search events, organizers..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
          ]}
          onPress={() => {
            console.log("[DiscoverScreen] Filter button pressed");
            setFilterModalVisible(true);
          }}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={actualTheme === "dark" ? colors.background : "#fff"}
          />
        </TouchableOpacity>
      </View>

      {isLoadingInitial ? (
        <View style={[styles.flex1, styles.center]}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.tint}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Featured Section */}
          {!selectedCategory &&
            !debouncedSearch &&
            featuredEvents.length > 0 && (
              <View style={styles.featuredSection}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Featured
                  </Text>
                </View>
                <FeaturedCarousel events={featuredEvents} />
              </View>
            )}

          {/* Categories */}
          {!categoriesLoading && categoriesData && (
            <View style={styles.categoriesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Categories
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContent}
              >
                {categoriesData.map((category: any) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor:
                          actualTheme === "dark" ? colors.card : "#fff",
                        borderColor: colors.border,
                      },
                      selectedCategory === category.id && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => handleCategoryPress(category.id)}
                  >
                    {category.icon &&
                    (category.icon.startsWith("http") ||
                      category.icon.startsWith("/")) ? (
                      <Image
                        source={{
                          uri: category.icon.startsWith("/")
                            ? `${Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL}${category.icon}`
                            : category.icon,
                        }}
                        style={[
                          styles.categoryIconImage,
                          {
                            tintColor:
                              selectedCategory === category.id
                                ? "#fff"
                                : undefined,
                          },
                        ]}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.categoryIcon,
                          {
                            color:
                              selectedCategory === category.id
                                ? "#fff"
                                : colors.text,
                          },
                        ]}
                      >
                        {category.icon || "✨"}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.categoryName,
                        {
                          color:
                            selectedCategory === category.id
                              ? "#fff"
                              : colors.secondary,
                        },
                        selectedCategory === category.id &&
                          styles.categoryNameActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Events List */}
          <View style={styles.eventsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {selectedCategory || debouncedSearch
                  ? "Found Events"
                  : "Trending"}{" "}
                ( {listEvents.length} )
              </Text>
              {(selectedCategory ||
                debouncedSearch ||
                filters.city ||
                filters.isFree !== undefined ||
                filters.isVirtual !== undefined) && (
                <TouchableOpacity onPress={resetFilters}>
                  <Text style={[styles.seeAllText, { color: colors.tint }]}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.eventsContent}>
              {listEvents.length > 0 ? (
                listEvents.map((item: any) => (
                  <EventCard key={item.id} event={item} />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="calendar-outline"
                    size={48}
                    color={colors.secondary}
                  />
                  <Text style={[styles.emptyText, { color: colors.secondary }]}>
                    No events found
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setFilterModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View
              style={[styles.dragIndicator, { backgroundColor: colors.border }]}
            />

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Filters
              </Text>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.border }]}
                onPress={() => setFilterModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalSection}>
                <View style={styles.labelRow}>
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={colors.tint}
                  />
                  <Text style={[styles.label, { color: colors.text }]}>
                    City
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor:
                        actualTheme === "dark" ? colors.background : "#F8F9FA",
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Enter city"
                  placeholderTextColor={colors.secondary}
                  value={filters.city}
                  onChangeText={(text) =>
                    setFilters({ ...filters, city: text })
                  }
                />
              </View>

              <View style={styles.modalSection}>
                <View style={styles.labelRow}>
                  <Ionicons name="cash-outline" size={18} color={colors.tint} />
                  <Text style={[styles.label, { color: colors.text }]}>
                    Pricing
                  </Text>
                </View>
                <View style={styles.filterRow}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          actualTheme === "dark" ? colors.background : "#fff",
                        borderColor: colors.border,
                      },
                      filters.isFree === true && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        isFree: filters.isFree === true ? undefined : true,
                      })
                    }
                  >
                    <Ionicons
                      name="gift-outline"
                      size={16}
                      color={
                        filters.isFree === true
                          ? actualTheme === "dark"
                            ? colors.background
                            : "#fff"
                          : colors.secondary
                      }
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color:
                            filters.isFree === true
                              ? actualTheme === "dark"
                                ? colors.background
                                : "#fff"
                              : colors.secondary,
                        },
                      ]}
                    >
                      Free
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          actualTheme === "dark" ? colors.background : "#fff",
                        borderColor: colors.border,
                      },
                      filters.isFree === false && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        isFree: filters.isFree === false ? undefined : false,
                      })
                    }
                  >
                    <Ionicons
                      name="card-outline"
                      size={16}
                      color={
                        filters.isFree === false
                          ? actualTheme === "dark"
                            ? colors.background
                            : "#fff"
                          : colors.secondary
                      }
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color:
                            filters.isFree === false
                              ? actualTheme === "dark"
                                ? colors.background
                                : "#fff"
                              : colors.secondary,
                        },
                      ]}
                    >
                      Paid
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.labelRow}>
                  <Ionicons
                    name="globe-outline"
                    size={18}
                    color={colors.tint}
                  />
                  <Text style={[styles.label, { color: colors.text }]}>
                    Event Type
                  </Text>
                </View>
                <View style={styles.filterRow}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          actualTheme === "dark" ? colors.background : "#fff",
                        borderColor: colors.border,
                      },
                      filters.isVirtual === true && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        isVirtual:
                          filters.isVirtual === true ? undefined : true,
                      })
                    }
                  >
                    <Ionicons
                      name="videocam-outline"
                      size={16}
                      color={
                        filters.isVirtual === true
                          ? actualTheme === "dark"
                            ? colors.background
                            : "#fff"
                          : colors.secondary
                      }
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color:
                            filters.isVirtual === true
                              ? actualTheme === "dark"
                                ? colors.background
                                : "#fff"
                              : colors.secondary,
                        },
                      ]}
                    >
                      Virtual
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          actualTheme === "dark" ? colors.background : "#fff",
                        borderColor: colors.border,
                      },
                      filters.isVirtual === false && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        isVirtual:
                          filters.isVirtual === false ? undefined : false,
                      })
                    }
                  >
                    <Ionicons
                      name="business-outline"
                      size={16}
                      color={
                        filters.isVirtual === false
                          ? actualTheme === "dark"
                            ? colors.background
                            : "#fff"
                          : colors.secondary
                      }
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color:
                            filters.isVirtual === false
                              ? actualTheme === "dark"
                                ? colors.background
                                : "#fff"
                              : colors.secondary,
                        },
                      ]}
                    >
                      In-Person
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View
              style={[styles.modalFooter, { borderTopColor: colors.border }]}
            >
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  {
                    backgroundColor:
                      actualTheme === "dark" ? colors.background : "#fff",
                    borderColor: colors.border,
                  },
                ]}
                onPress={resetFilters}
              >
                <Text style={[styles.resetButtonText, { color: colors.text }]}>
                  Reset All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  {
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                  },
                ]}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text
                  style={[
                    styles.applyButtonText,
                    {
                      color:
                        actualTheme === "dark" ? colors.background : "#fff",
                    },
                  ]}
                >
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Chat Button & Modal */}
      <ChatButton onPress={() => setIsChatVisible(true)} />
      <ChatModal
        visible={isChatVisible}
        onClose={() => setIsChatVisible(false)}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 60,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  greetingText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  userNameText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1,
    borderColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#111827",
    paddingVertical: 0,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredSection: {
    marginBottom: 32,
  },
  categoriesSection: {
    marginBottom: 32,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    marginBottom: 4,
    gap: 12,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryIconImage: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  categoryNameActive: {
    color: "#fff",
  },
  eventsSection: {
    marginBottom: 32,
  },
  eventsContent: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 8,
    color: "#9CA3AF",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 34,
    maxHeight: "85%",
    ...Layout.shadows.large,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4FB",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    flexGrow: 0,
  },
  modalSection: {
    marginBottom: 28,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },
  modalInput: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: "#111827",
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
  },
  filterChip: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    gap: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    ...Layout.shadows.medium,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 24,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4B5563",
  },
  applyButton: {
    flex: 2,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 16,
    ...Layout.shadows.medium,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
