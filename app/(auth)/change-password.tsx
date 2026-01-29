import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useChangePassword } from '../../hooks/use-change-password';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token: string }>();
  const changePasswordMutation = useChangePassword();
  const { actualTheme } = useTheme();
  const colors = Colors[actualTheme];
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showToast: toast } = useToast();

  const handleChangePassword = () => {
    if (!password || !confirmPassword) {
      toast({ message: 'Please fill in all fields', type: 'warning' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ message: 'Passwords do not match', type: 'warning' });
      return;
    }

    if (!params.token) {
      toast({ message: 'Invalid reset token. Please request a new one.', type: 'error' });
      return;
    }

    changePasswordMutation.mutate(
      { token: params.token, newPassword: password },
      {
        onSuccess: () => {
          toast({ message: 'Password changed successfully! Please sign in.', type: 'success' });
          router.replace("/(auth)/sign-in");
        },
        onError: (error) => {
          toast({ message: error.message || 'Failed to change password', type: 'error' });
        },
      }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: actualTheme === 'dark' ? colors.card : '#f5f5f5' }]}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: colors.secondary }]}>Enter your new password below.</Text>

            <View style={styles.form}>
              <View style={[styles.inputContainer, { backgroundColor: actualTheme === 'dark' ? colors.card : '#f5f5f5' }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.secondary} style={styles.inputIcon} />
                <TextInput 
                  style={[styles.input, { color: colors.text }]} 
                  placeholder="New Password" 
                  placeholderTextColor={colors.secondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.secondary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainer, { backgroundColor: actualTheme === 'dark' ? colors.card : '#f5f5f5' }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.secondary} style={styles.inputIcon} />
                <TextInput 
                  style={[styles.input, { color: colors.text }]} 
                  placeholder="Confirm Password" 
                  placeholderTextColor={colors.secondary}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.secondary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.tint, shadowColor: colors.tint }, changePasswordMutation.isPending && styles.buttonDisabled]} 
                onPress={handleChangePassword}
                disabled={changePasswordMutation.isPending}
              >
                <Text style={styles.buttonText}>
                  {changePasswordMutation.isPending ? 'Updating...' : 'Reset Password'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 48,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
