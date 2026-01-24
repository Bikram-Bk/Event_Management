import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../context/ThemeContext";

export default function EarningsDashboard() {
  const router = useRouter();
  const { actualTheme } = useTheme();
  const colors = Colors[actualTheme];
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
    <View style={[styles.card, { backgroundColor: colors.card, shadowColor: actualTheme === 'dark' ? '#000' : '#000' }]}>
      <View style={[styles.cardIcon, { backgroundColor: actualTheme === 'dark' ? colors.border : '#F3F4F6' }]}>
        <Ionicons
          name={item.type === "COMMISSION" ? "trending-up" : "ticket-outline"}
          size={24}
          color={colors.tint}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.cardDate, { color: colors.secondary }]}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.secondary }]}>{item.subtitle}</Text>
      </View>
      <View style={styles.cardAmount}>
        <Text style={styles.amountText}>+{item.amount} NPR</Text>
        {item.fee > 0 && <Text style={styles.feeText}>Fee: {item.fee}</Text>}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  const balance = userData?.balance
    ? Number(userData.balance).toLocaleString()
    : "0";

  const renderHeader = () => (
    <View>
      {/* Header with Balance */}
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payout Requests</Text>
          <FlatList
            data={payouts}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.payoutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.payoutAmount, { color: colors.text }]}>NPR {item.amount}</Text>
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
                <Text style={[styles.payoutDate, { color: colors.secondary }]}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          />
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
            colors={[colors.tint]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={colors.secondary} />
            <Text style={[styles.emptyText, { color: colors.secondary }]}>No transactions yet</Text>
          </View>
        }
      />
 
      {/* Withdrawal Modal */}
      <Modal 
        visible={withdrawModalVisible} 
        transparent 
        animationType="fade"
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Withdraw Funds</Text>
              <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.secondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.secondary }]}>Amount (NPR)</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Enter Amount"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
              />
              
              <Text style={[styles.inputLabel, { color: colors.secondary }]}>Khalti/Wallet Number</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Phone Number"
                placeholderTextColor={colors.secondary}
                keyboardType="phone-pad"
                value={khaltiNumber}
                onChangeText={setKhaltiNumber}
              />
 
              <TouchableOpacity
                onPress={handleWithdraw}
                style={[styles.confirmBtn, { backgroundColor: colors.tint }]}
              >
                <Text style={styles.confirmBtnText}>Confirm Withdrawal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  backButton: { position: "absolute", top: 55, left: 15, padding: 10, zIndex: 10 },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 20,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 5,
  },
  balanceValue: { 
    color: "#fff", 
    fontSize: 36, 
    fontWeight: "900", 
    letterSpacing: -1,
    flexWrap: 'wrap',
    textAlign: 'center'
  },
 
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  list: { paddingBottom: 40 },
 
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: { flex: 1, flexShrink: 1 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardSubtitle: { fontSize: 12, marginTop: 4, opacity: 0.7 },
  cardDate: { fontSize: 11, fontWeight: "600", opacity: 0.5 },
 
  cardAmount: { alignItems: "flex-end", marginLeft: 10 },
  amountText: { fontSize: 17, fontWeight: "800", color: "#10B981" },
  feeText: { fontSize: 10, color: "#EF4444", marginTop: 2, fontWeight: "600" },
 
  empty: { alignItems: "center", marginTop: 60, padding: 40 },
  emptyText: { marginTop: 12, fontSize: 15, fontWeight: "600" },
 
  withdrawButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  withdrawText: { color: "#fff", fontWeight: "700", fontSize: 14 },
 
  payoutCard: {
    padding: 18,
    borderRadius: 20,
    marginRight: 12,
    minWidth: 150,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  payoutAmount: { fontWeight: "800", fontSize: 18 },
  payoutStatus: { fontSize: 11, fontWeight: "800", marginTop: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  payoutDate: { fontSize: 10, fontWeight: "600", marginTop: 4, opacity: 0.5 },
 
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    width: "100%",
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  modalBody: {},
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  confirmBtn: {
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
