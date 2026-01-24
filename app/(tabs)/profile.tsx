import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useUserEvents } from "../../hooks/use-attendees";
import { useGetUser } from "../../hooks/use-get-user";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#C5A572",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#f0f0f0",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "#f0f0f0",
    alignSelf: "center",
  },
  menuContainer: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f8f8",
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    marginLeft: 14,
    color: "#333",
    fontWeight: "500",
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#FF3B30",
  },
});

export default function ProfileTab() {
  const router = useRouter();
  const { actualTheme } = useTheme();
  const colors = Colors[actualTheme];
  const { signOut } = useAuth();
  
  const {
    data: userData,
    isLoading: userLoading,
    refetch: refetchUser,
  } = useGetUser();
  
  const {
    data: userEvents,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useUserEvents();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchUser(), refetchEvents()]);
    setRefreshing(false);
  }, [refetchUser, refetchEvents]);

  if (userLoading || eventsLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  const user = userData?.data;
  const events = userEvents || [];
  // @ts-ignore
  const balance = user?.balance ? Number(user.balance) : 0;
  const formattedBalance = "NPR " + balance.toLocaleString();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={actualTheme === 'dark' ? "light-content" : "dark-content"} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.tint]}
          />
        }
      >
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.tint, borderColor: colors.border }]}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={50} color="#fff" />
            )}
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user?.username || "Guest"}</Text>
          <Text style={[styles.email, { color: colors.secondary }]}>{user?.email || ""}</Text>
        </View>

        {/* Stats Section */}
        <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push("/(tabs)/events")}
          >
            <Text style={[styles.statNumber, { color: colors.text }]}>{events.length}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Events</Text>
          </TouchableOpacity>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.tint }]}>
              {formattedBalance}
            </Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>My Earnings</Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
          {/* Earnings Button */}
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/earnings")}
          >
            <Ionicons name="wallet-outline" size={22} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>View My Earnings</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.secondary} />
          </TouchableOpacity>

          {/* Admin Settings */}
          {user?.role === "ADMIN" && (
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => router.push("/settings/commission")}
            >
              <Ionicons name="options-outline" size={22} color={colors.text} />
              <Text style={[styles.menuText, { color: colors.text }]}>Commission Settings</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.secondary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/settings/profile-settings")}
          >
            <Ionicons name="settings-outline" size={22} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Settings</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/favourites/favourite")}
          >
            <Ionicons name="heart-outline" size={22} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Favourites</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.secondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/helpsupport/help")}
          >
            <Ionicons name="help-circle-outline" size={22} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={signOut}
          >
            <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
            <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
