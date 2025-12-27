import { useMutation } from "@tanstack/react-query";

interface ChangePasswordPayload {
  token: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}


export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (
      payload: ChangePasswordPayload
    ): Promise<ChangePasswordResponse> => {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || "Failed to change password"
        );
      }

      return data;
    },
  });
};
