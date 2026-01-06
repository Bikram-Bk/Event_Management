import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export default function EarningsDashboard() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [khaltiNumber, setKhaltiNumber] = useState("");

  const apiUrl =
    Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");

      // 1. Fetch User (for Balance)
      const userRes = await fetch(`${apiUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userJson = await userRes.json();
      if (userJson.success) setUserData(userJson.data);

      // 2. Fetch Transactions (Stats)
      const statsRes = await fetch(`${apiUrl}/api/users/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsJson = await statsRes.json();
      if (statsJson.success) setTransactions(statsJson.data.transactions);

      // 3. Fetch Payouts
      const payoutRes = await fetch(`${apiUrl}/api/payouts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payoutJson = await payoutRes.json();
      if (payoutJson.success) setPayouts(payoutJson.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount");
      return;
    }
    if (!khaltiNumber) {
      alert("Please enter Khalti Number");
      return;
    }

    const token = await AsyncStorage.getItem("accessToken");
    try {
      const res = await fetch(`${apiUrl}/api/payouts/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, khaltiNumber }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Withdrawal Requested!");
        setWithdrawModalVisible(false);
        setWithdrawAmount("");
        setKhaltiNumber("");
        fetchData(); // Refresh balance and lists
      } else {
        alert(json.error || "Failed");
      }
    } catch (e) {
      alert("Error processing withdrawal");
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        <Ionicons
          name={item.type === "COMMISSION" ? "trending-up" : "ticket-outline"}
          size={24}
          color={Colors.light.tint}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.cardAmount}>
        <Text style={styles.amountText}>+{item.amount} NPR</Text>
        {item.fee > 0 && <Text style={styles.feeText}>Fee: {item.fee}</Text>}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  const balance = userData?.balance
    ? Number(userData.balance).toLocaleString()
    : "0";

  const renderHeader = () => (
    <View>
      {/* Header with Balance */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Earnings</Text>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceValue}>NPR {balance}</Text>

        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={() => setWithdrawModalVisible(true)}
        >
          <Text style={styles.withdrawText}>Request Payout</Text>
        </TouchableOpacity>
      </View>

      {/* Payouts Section */}
      {payouts.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Payout Requests</Text>
          <FlatList
            data={payouts}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }) => (
              <View style={styles.payoutCard}>
                <Text style={styles.payoutAmount}>NPR {item.amount}</Text>
                <Text
                  style={[
                    styles.payoutStatus,
                    {
                      color: item.status === "PENDING" ? "#F59E0B" : "#10B981",
                    },
                  ]}
                >
                  {item.status}
                </Text>
                <Text style={styles.payoutDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          />
        </View>
      )}

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.tint]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        }
      />

      {/* Withdrawal Modal */}
      {withdrawModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Withdraw Funds</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Amount (NPR)"
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="Khalti/Wallet Number"
              keyboardType="phone-pad"
              value={khaltiNumber}
              onChangeText={setKhaltiNumber}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setWithdrawModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleWithdraw}
                style={styles.confirmBtn}
              >
                <Text style={{ color: "#fff" }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: Colors.light.tint,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: { position: "absolute", top: 50, left: 20, padding: 10 },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 5,
  },
  balanceValue: { color: "#fff", fontSize: 32, fontWeight: "bold" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 20,
    marginBottom: 10,
  },
  list: { padding: 20 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  cardSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  cardDate: { fontSize: 11, color: "#9CA3AF", marginBottom: 2 },

  cardAmount: { alignItems: "flex-end" },
  amountText: { fontSize: 16, fontWeight: "bold", color: "#10B981" },
  feeText: { fontSize: 11, color: "#EF4444" },

  empty: { alignItems: "center", marginTop: 50 },
  emptyText: { marginTop: 10, color: "#9CA3AF" },

  withdrawButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  withdrawText: { color: "#fff", fontWeight: "600" },

  payoutCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    minWidth: 120,
    borderWidth: 1,
    borderColor: "#eee",
  },
  payoutAmount: { fontWeight: "bold", fontSize: 16, color: "#333" },
  payoutStatus: { fontSize: 12, fontWeight: "600", marginVertical: 4 },
  payoutDate: { fontSize: 10, color: "#999" },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "80%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: { flexDirection: "row", gap: 10 },
  cancelBtn: { padding: 10, flex: 1, alignItems: "center" },
  confirmBtn: {
    padding: 10,
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
  },
});
