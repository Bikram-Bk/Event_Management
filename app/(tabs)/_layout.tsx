import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../context/ThemeContext";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { actualTheme } = useTheme();
  const colors = Colors[actualTheme];

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.secondary,
          tabBarStyle: {
            position: "absolute",
            bottom: 25,
            left: 20,
            right: 20,

            elevation: 5,
            backgroundColor: colors.card,
            borderRadius: 30, // Pill shape
            height: 60,
            paddingBottom: 0, // Center icons vertically
            borderTopWidth: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: actualTheme === 'dark' ? 0.3 : 0.15,
            shadowRadius: 10,
            marginHorizontal: 12,
            borderWidth: actualTheme === 'dark' ? 1 : 0,
            borderColor: colors.border,
          },
          tabBarShowLabel: false,
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
        <Tabs.Screen
          name="helpsupport/index"
          options={{
            href: null,
          }}
        />
      </Tabs>
      <StatusBar barStyle={actualTheme === 'dark' ? "light-content" : "dark-content"} />
    </View>
  );
}
