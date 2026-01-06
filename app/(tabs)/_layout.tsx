import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#C5A572", // Gold tint
          tabBarInactiveTintColor: "#8E8E93",
          tabBarStyle: {
            position: "absolute",
            bottom: 25,
            left: 20,
            right: 20,

            elevation: 5,
            backgroundColor: "#fff",
            borderRadius: 30, // Pill shape
            height: 60,
            paddingBottom: 0, // Center icons vertically
            borderTopWidth: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            marginHorizontal: 12,
          },
          tabBarShowLabel: false, // Cleaner look for floating tabs usually, or keep it if preferred. Let's keep label for clarity but style it? User said "floating type", usually implies minimal. Let's try hiding label or making it small. Let's keep default first but maybe adjust padding.
          // Actually user didn't say hide label.
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size, focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  top: 10,
                }}
              >
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={24}
                  color={color}
                />
                {focused && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: color,
                      marginTop: 4,
                    }}
                  />
                )}
              </View>
            ),
            tabBarLabel: ({ focused, color }) => null, // Hiding label for cleaner floating look as per modern design trends
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: "My Events",
            tabBarIcon: ({ color, size, focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  top: 10,
                }}
              >
                <Ionicons
                  name={focused ? "ticket" : "ticket-outline"}
                  size={24}
                  color={color}
                />
                {focused && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: color,
                      marginTop: 4,
                    }}
                  />
                )}
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="requests"
          options={{
            title: "Requests",
            tabBarIcon: ({ color, size, focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  top: 10,
                }}
              >
                <Ionicons
                  name={focused ? "document-text" : "document-text-outline"}
                  size={24}
                  color={color}
                />
                {focused && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: color,
                      marginTop: 4,
                    }}
                  />
                )}
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size, focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  top: 10,
                }}
              >
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={24}
                  color={color}
                />
                {focused && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: color,
                      marginTop: 4,
                    }}
                  />
                )}
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
      </Tabs>
      <StatusBar barStyle="dark-content" />
    </View>
  );
}
