import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
export default function AuthLayout() {
  return (
  <>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
    <StatusBar barStyle='dark-content'/>
  </>
  );
}
