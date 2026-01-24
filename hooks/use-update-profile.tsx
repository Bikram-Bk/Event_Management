import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateProfilePayload {
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string; // This can be a local URI that needs uploading
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");

      let finalPayload = { ...payload };

      // Step 1: Handle Image Upload if a local URI is provided
      if (payload.avatar && (payload.avatar.startsWith('file://') || payload.avatar.startsWith('content://'))) {
        const formData = new FormData();
        const uri = payload.avatar;
        const filename = uri.split("/").pop() || "avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // @ts-ignore
        formData.append("file", {
          uri,
          name: filename,
          type,
        });

        const uploadResponse = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok || !uploadData.success) {
          throw new Error(uploadData.message || "Failed to upload image");
        }

        // Use the resulting server URL for the final update
        finalPayload.avatar = uploadData.data.url;
      }

      // Step 2: Update Profile via JSON API
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/users/update-profile`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalPayload),
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
