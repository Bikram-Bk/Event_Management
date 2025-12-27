import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';

type User = {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  avatar?: string | null;
};

type GetUserResponse = {
  success: boolean;
  data: User;
  message?: string;
  error?: string;
};

export const useGetUser = () => {
  return useQuery<GetUserResponse, Error>({
    queryKey: ['user'],
    queryFn: async () => {
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch user');
      }

      return data;
    },
    retry: false,
  });
};
