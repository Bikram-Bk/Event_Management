import { Ionicons } from "@expo/vector-icons";
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
  View
} from "react-native";
import EventCard from "../../components/EventCard";
import FeaturedCarousel from "../../components/FeaturedCarousel";
import { Colors, Layout } from "../../constants/Colors";
import { useCategories } from "../../hooks/use-categories";
import { useEvents } from "../../hooks/use-events";
import { useGetUser } from "../../hooks/use-get-user";

export default function DiscoverScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: userData } = useGetUser();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
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
      selectedCategory === categoryId ? undefined : categoryId
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
  const isFiltering = !!(selectedCategory || debouncedSearch || filters.city || filters.isFree !== undefined || filters.isVirtual !== undefined);
  const listEvents = isFiltering ? events : events.slice(3);

  console.log(`[DiscoverScreen] Events loaded: ${events.length}, Filtering: ${isFiltering}`);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const isLoadingInitial = eventsLoading && !eventsData;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={20} color={Colors.light.tint} />
              </View>
            )}
          </View>
          <View>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.userNameText} numberOfLines={1}>
              {user?.username || "Guest"}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push("/create-event")}
          >
            <Ionicons name="add" size={24} color={Colors.light.tint} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.light.text} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, organizers..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => {
            console.log("[DiscoverScreen] Filter button pressed");
            setFilterModalVisible(true);
          }}
        >
          <Ionicons name="options-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoadingInitial ? (
        <View style={[styles.flex1, styles.center]}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.light.tint}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Featured Section */}
          {!selectedCategory && !debouncedSearch && featuredEvents.length > 0 && (
            <View style={styles.featuredSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured</Text>
              </View>
              <FeaturedCarousel events={featuredEvents} />
            </View>
          )}

          {/* Categories */}
          {!categoriesLoading && categoriesData && (
            <View style={styles.categoriesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
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
                      selectedCategory === category.id &&
                        styles.categoryChipActive,
                    ]}
                    onPress={() => handleCategoryPress(category.id)}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text
                      style={[
                        styles.categoryName,
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
              <Text style={styles.sectionTitle}>
                {selectedCategory || debouncedSearch ? "Found Events" : "Trending"}
              </Text>
              {(selectedCategory || debouncedSearch || filters.city || filters.isFree !== undefined || filters.isVirtual !== undefined) && (
                <TouchableOpacity onPress={resetFilters}>
                  <Text style={styles.seeAllText}>Clear All</Text>
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
                  <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No events found</Text>
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
          <View style={styles.modalContent}>
            <View style={styles.dragIndicator} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <View style={styles.labelRow}>
                  <Ionicons name="location-outline" size={18} color={Colors.light.tint} />
                  <Text style={styles.label}>City</Text>
                </View>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter city name..."
                  placeholderTextColor="#9CA3AF"
                  value={filters.city}
                  onChangeText={(text: string) => setFilters({ ...filters, city: text })}
                />
              </View>

              <View style={styles.modalSection}>
                <View style={styles.labelRow}>
                  <Ionicons name="videocam-outline" size={18} color={Colors.light.tint} />
                  <Text style={styles.label}>Event Type</Text>
                </View>
                <View style={styles.filterRow}>
                  <TouchableOpacity
                    style={[styles.filterChip, filters.isVirtual === true && styles.filterChipActive]}
                    onPress={() => setFilters({ ...filters, isVirtual: filters.isVirtual === true ? undefined : true })}
                  >
                    <Ionicons 
                      name="globe-outline" 
                      size={16} 
                      color={filters.isVirtual === true ? "#fff" : "#4B5563"} 
                    />
                    <Text style={[styles.filterChipText, filters.isVirtual === true && styles.filterChipTextActive]}>Virtual</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterChip, filters.isVirtual === false && styles.filterChipActive]}
                    onPress={() => setFilters({ ...filters, isVirtual: filters.isVirtual === false ? undefined : false })}
                  >
                    <Ionicons 
                      name="business-outline" 
                      size={16} 
                      color={filters.isVirtual === false ? "#fff" : "#4B5563"} 
                    />
                    <Text style={[styles.filterChipText, filters.isVirtual === false && styles.filterChipTextActive]}>Physical</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.labelRow}>
                  <Ionicons name="pricetag-outline" size={18} color={Colors.light.tint} />
                  <Text style={styles.label}>Pricing</Text>
                </View>
                <View style={styles.filterRow}>
                  <TouchableOpacity
                    style={[styles.filterChip, filters.isFree === true && styles.filterChipActive]}
                    onPress={() => setFilters({ ...filters, isFree: filters.isFree === true ? undefined : true })}
                  >
                    <Ionicons 
                      name="gift-outline" 
                      size={16} 
                      color={filters.isFree === true ? "#fff" : "#4B5563"} 
                    />
                    <Text style={[styles.filterChipText, filters.isFree === true && styles.filterChipTextActive]}>Free</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterChip, filters.isFree === false && styles.filterChipActive]}
                    onPress={() => setFilters({ ...filters, isFree: filters.isFree === false ? undefined : false })}
                  >
                    <Ionicons 
                      name="card-outline" 
                      size={16} 
                      color={filters.isFree === false ? "#fff" : "#4B5563"} 
                    />
                    <Text style={[styles.filterChipText, filters.isFree === false && styles.filterChipTextActive]}>Paid</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
