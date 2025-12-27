import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLogin } from '../app/api/use-login';

type User = {
  name: string;
  email: string;
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  signIn: (email: string, password?: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const loginMutation = useLogin();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('accessToken');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setIsInitializing(false);
      }
    };

    loadUser();
  }, []);

  const signIn = (email: string, password?: string) => {
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: async (data) => {
          const userData = data.data.user;
          setUser(userData);
          try {
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('accessToken', data.data.accessToken);
            await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
          } catch (error) {
            console.error('Failed to save user data', error);
          }
          router.replace('/(tabs)');
        },
        onError: (error) => {
          console.error('Login failed:', error);
          alert('Login failed: ' + error.message);
        }
      }
    );
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Failed to remove user data', error);
    }
    setUser(null);
    router.replace('/(auth)/sign-in');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: isInitializing || loginMutation.isPending, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
