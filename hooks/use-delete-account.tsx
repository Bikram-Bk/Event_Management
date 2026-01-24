import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/users/delete-account`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete account");
      }
      
      // Clear token after deletion
      await AsyncStorage.removeItem("accessToken");
      return data;
    },
  });
};
