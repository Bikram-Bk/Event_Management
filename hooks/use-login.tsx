import { useMutation } from '@tanstack/react-query';

// Define the shape of the login credentials
type LoginCredentials = {
  email: string;
  password?: string;
};

// Define the shape of the response
type LoginResponse = {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      name: string;
      email: string;
      username?: string;
      phone?: string;
      avatar?: string | null;
    };
  };
  message: string;
  error?: string;
};

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      return data;
    },
  });
};
