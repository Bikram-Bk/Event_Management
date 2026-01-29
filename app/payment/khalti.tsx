import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Colors } from "../../constants/Colors";
import { useToast } from "../../context/ToastContext";

const API_URL =
  Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

export default function KhaltiPaymentScreen() {
  const { url, attendeeId } = useLocalSearchParams();
  const router = useRouter();
  const [polling, setPolling] = useState(true);
  const { showToast } = useToast();

  // Poll for payment status in case deep link fails
  useEffect(() => {
    if (!attendeeId || !polling) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/payments/status/${attendeeId}`);
        const json = await res.json();

        if (json.success && json.data.status === "COMPLETED") {
          clearInterval(interval);
          setPolling(false);
          router.replace("/payment/success");
        }
      } catch (e) {
        // Ignore errors during polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [attendeeId, polling]);

  if (!url || typeof url !== "string") {
    showToast({ message: "Invalid payment URL", type: "error" });
    router.back();
    return null;
  }

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;

    // Check for success/failure redirects from backend
    // Backend redirects to: eventmanagement://payment/success or failure
    // We can also check for the callback URL itself if we want to confirm completion

    if (url.includes("payment/success")) {
      setPolling(false);
      router.replace("/payment/success");
      return false; // Stop loading
    }

    if (url.includes("payment/failure")) {
      setPolling(false);
      router.replace("/payment/failure");
      return false; // Stop loading
    }

    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={Colors.light.tint} />
          </View>
        )}
        onNavigationStateChange={handleNavigationStateChange}
        // Specific handling for custom schemes if needed
        onShouldStartLoadWithRequest={(request) => {
          if (
            request.url.startsWith("eventmanagement://") ||
            request.url.startsWith("exp+event-management://")
          ) {
            setPolling(false);
            handleNavigationStateChange(request);
            return false;
          }
          return true;
        }}
      />
      {/* Fallback Close Button in case redirect fails */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webview: {
    flex: 1,
  },
  loading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  closeButton: {
    backgroundColor: Colors.light.tint,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
