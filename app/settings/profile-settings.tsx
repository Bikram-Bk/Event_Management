import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useDeleteAccount } from "../../hooks/use-delete-account";
import { useGetUser } from "../../hooks/use-get-user";
import { useSettingsChangePassword } from "../../hooks/use-settings-change-password";
import { useUpdateProfile } from "../../hooks/use-update-profile";

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { theme, setTheme, actualTheme } = useTheme();
  const { data: userData } = useGetUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useSettingsChangePassword();
  const deleteAccount = useDeleteAccount();
  const { showToast } = useToast();

  const [isUploading, setIsUploading] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
  
  // Generic Input Modal state
  const [isInputModalVisible, setIsInputModalVisible] = useState(false);
  const [activeField, setActiveField] = useState<"username" | "email" | "phone" | null>(null);
  const [inputValue, setInputValue] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
 
  // Password Visibility States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const user = userData?.data;
  const colors = Colors[actualTheme];

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast({ message: "Permission to access gallery is required.", type: "warning" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      uploadAvatar(selectedImage);
    }
  };

  const uploadAvatar = async (uri: string) => {
    setIsUploading(true);
    try {
      await updateProfile.mutateAsync({ avatar: uri });
      showToast({ message: "Profile photo updated successfully!", type: "success" });
    } catch (error: any) {
      showToast({ message: error.message || "Failed to update profile photo", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  const openInputModal = (field: "username" | "email" | "phone", initialValue: string) => {
    setActiveField(field);
    setInputValue(initialValue);
    setIsInputModalVisible(true);
  };

  const handleUpdateInfo = async () => {
    if (!activeField) return;
    const value = inputValue.trim();

    // Field-specific validation matching sign-up logic
    if (activeField === "username") {
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!value) {
        showToast({ message: "Full name is required", type: "error" });
        return;
      } else if (!nameRegex.test(value)) {
        showToast({ message: "Name should only contain letters", type: "error" });
        return;
      }
    } else if (activeField === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        showToast({ message: "Email is required", type: "error" });
        return;
      } else if (!emailRegex.test(value)) {
        showToast({ message: "Please enter a valid email address", type: "error" });
        return;
      }
    } else if (activeField === "phone") {
      const phoneRegex = /^\d{10}$/;
      if (value && !phoneRegex.test(value)) {
        showToast({ message: "Phone number must be exactly 10 digits", type: "error" });
        return;
      }
    }
    
    try {
      await updateProfile.mutateAsync({ [activeField]: value });
      showToast({ message: `${activeField.charAt(0).toUpperCase() + activeField.slice(1)} updated successfully!`, type: "success" });
      setIsInputModalVisible(false);
    } catch (error: any) {
      showToast({ message: error.message || `Failed to update ${activeField}`, type: "error" });
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast({ message: "Please fill all fields", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({ message: "New passwords do not match", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      showToast({ message: "Password must be at least 6 characters", type: "error" });
      return;
    }

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      showToast({ message: "Password changed successfully!", type: "success" });
      setIsPasswordModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      showToast({ message: error.message || "Failed to change password", type: "error" });
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleteModalVisible(false);
    try {
      await deleteAccount.mutateAsync();
      showToast({ message: "Account deleted successfully.", type: "success" });
      router.replace("/(auth)/welcome");
    } catch (error: any) {
      showToast({ message: error.message || "Failed to delete account", type: "error" });
    }
  };
 
  const getFullImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const apiUrl =
      Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
    return `${apiUrl}${path}`;
  };
 
  const renderMenuItem = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    subtitle: string,
    onPress: () => void,
    isDanger = false
  ) => (
    <TouchableOpacity 
      style={[styles.menuItem, { borderBottomColor: colors.border }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuItemIcon, isDanger ? styles.dangerIcon : { backgroundColor: colors.tint + '10' }]}>
        <Ionicons name={icon} size={22} color={isDanger ? "#FF3B30" : colors.tint} />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={[styles.menuItemTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.menuItemSubtitle, { color: colors.secondary }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.secondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image 
                source={{ uri: getFullImageUrl(user.avatar) || undefined }} 
                style={styles.avatar} 
              />
            ) : (
              <Ionicons name="person" size={40} color={colors.secondary} />
            )}
            {isUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
            <TouchableOpacity style={[styles.editBadge, { backgroundColor: colors.tint }]} onPress={handlePickImage}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{user?.username || "Guest"}</Text>
            <Text style={[styles.profileEmail, { color: colors.secondary }]}>{user?.email || "No email provided"}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account & Security</Text>
        <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {renderMenuItem(
            "person-outline",
            "Username",
            user?.username || "Not set",
            () => openInputModal("username", user?.username || "")
          )}
          {renderMenuItem(
            "mail-outline",
            "Email Address",
            user?.email || "Not set",
            () => openInputModal("email", user?.email || "")
          )}
          {renderMenuItem(
            "call-outline",
            "Phone Number",
            user?.phone || "Not set",
            () => openInputModal("phone", user?.phone || "")
          )}
          {renderMenuItem(
            "lock-closed-outline",
            "Change Password",
            "Updated recently",
            () => setIsPasswordModalVisible(true)
          )}
        </View>

        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {renderMenuItem(
            "color-palette-outline",
            "Interface Theme",
            theme.charAt(0).toUpperCase() + theme.slice(1),
            () => setIsThemeModalVisible(true)
          )}
        </View>

        <Text style={styles.sectionTitle}>Account Deletion</Text>
        <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {renderMenuItem(
              "trash-outline",
              "Delete My Account",
              "Permanent removal",
              () => setIsDeleteModalVisible(true),
              true
            )}
          </View>
        </ScrollView>

        <ConfirmModal
          visible={isDeleteModalVisible}
          title="Delete Account"
          message="Are you sure you want to delete your account? This action is permanent and cannot be undone."
          confirmText="Delete"
          type="danger"
          onConfirm={handleDeleteAccount}
          onCancel={() => setIsDeleteModalVisible(false)}
        />

      {/* Info Input Modal */}
      <Modal visible={isInputModalVisible} animationType="fade" transparent onRequestClose={() => setIsInputModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Update {activeField}</Text>
              <TouchableOpacity onPress={() => setIsInputModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={inputValue}
                onChangeText={setInputValue}
                autoFocus
                placeholder={`Enter new ${activeField}`}
                placeholderTextColor={colors.secondary}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.tint }, updateProfile.isPending && styles.disabledButton]}
                onPress={handleUpdateInfo}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Password Modal */}
      <Modal visible={isPasswordModalVisible} animationType="slide" transparent onRequestClose={() => setIsPasswordModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopLeftRadius: 30, borderTopRightRadius: 30 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Change Password</Text>
              <TouchableOpacity onPress={() => setIsPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={[styles.passwordInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.flex1, { color: colors.text }]}
                  secureTextEntry={!showCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.secondary}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Ionicons name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.secondary} />
                </TouchableOpacity>
              </View>
 
              <Text style={[styles.inputLabel, { marginTop: 15 }]}>New Password</Text>
              <View style={[styles.passwordInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.flex1, { color: colors.text }]}
                  secureTextEntry={!showNewPassword}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={colors.secondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.secondary} />
                </TouchableOpacity>
              </View>
 
              <Text style={[styles.inputLabel, { marginTop: 15 }]}>Confirm New Password</Text>
              <View style={[styles.passwordInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.flex1, { color: colors.text }]}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Repeat new password"
                  placeholderTextColor={colors.secondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.secondary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.tint, marginTop: 30 }, changePassword.isPending && styles.disabledButton]}
                onPress={handlePasswordChange}
                disabled={changePassword.isPending}
              >
                {changePassword.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Update Password</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Theme Modal */}
      <Modal visible={isThemeModalVisible} animationType="fade" transparent onRequestClose={() => setIsThemeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: 20, backgroundColor: colors.card, borderRadius: 24 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Theme</Text>
              <TouchableOpacity onPress={() => setIsThemeModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {(["light", "dark", "system"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.themeOption,
                    { backgroundColor: colors.background },
                    theme === t && { borderColor: colors.tint, borderWidth: 1 }
                  ]}
                  onPress={() => {
                    setTheme(t);
                    setIsThemeModalVisible(false);
                  }}
                >
                  <Text style={[styles.themeOptionText, { color: colors.text }, theme === t && { color: colors.tint, fontWeight: '700' }]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                  {theme === t && <Ionicons name="checkmark" size={20} color={colors.tint} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8E8E93",
    marginBottom: 12,
    marginTop: 5,
    paddingLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  menuGroup: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 25,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  menuItemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  dangerIcon: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuItemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  modalBody: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 8,
  },
  modalInput: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    fontSize: 16,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 4, // Reduce vertical padding to account for TextInput's own padding
    borderWidth: 1,
  },
  saveButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.5,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 16,
    marginBottom: 10,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
