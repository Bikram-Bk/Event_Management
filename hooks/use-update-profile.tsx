import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateProfilePayload {
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string; 
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");

      let body: any;
      let headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      if (payload.avatar) {
        // Use FormData if avatar is present
        const formData = new FormData();
        if (payload.username) formData.append("username", payload.username);
        if (payload.email) formData.append("email", payload.email);
        if (payload.phone) formData.append("phone", payload.phone);

        const uri = payload.avatar;
        const filename = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : `image`;

        // @ts-ignore
        formData.append("avatar", {
          uri,
          name: filename,
          type,
        });
        body = formData;
        // Fetch will set Content-Type to multipart/form-data with boundary
      } else {
        // Use JSON for textual updates only
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(payload);
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/users/update-profile`,
        {
          method: "PATCH",
          headers,
          body,
        }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
