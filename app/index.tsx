import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Add actual auth check here
  // For now, redirect to welcome screen to start the flow
  return <Redirect href="/(auth)/welcome" />;
}
