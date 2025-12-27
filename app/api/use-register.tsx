import { useMutation } from '@tanstack/react-query';

type RegisterCredentials = {
  name: string;
  email: string;
  password?: string;
};

type RegisterResponse = {
  success: boolean;
  data: {
    id: string;
    email: string;
    username: string;
    phone?: string;
    avatar?: string | null;
  };
  message?: string;
  error?: string;
};

export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterCredentials>({
    mutationFn: async (credentials) => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    },
  });
};
