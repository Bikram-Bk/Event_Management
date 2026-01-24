import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const useSettingsChangePassword = () => {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to change password");
      }
      return data;
    },
  });
};
