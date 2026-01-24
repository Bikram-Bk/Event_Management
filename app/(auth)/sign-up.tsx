import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegister } from '../../hooks/use-register';

export default function SignUpScreen() {
  const router = useRouter();
  const registerMutation = useRegister();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (!nameRegex.test(name)) {
      newErrors.name = 'Name should only contain letters';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<> ]).{8,}$/;
      if (!passwordRegex.test(password)) {
        newErrors.password = 'Password must be at least 8 characters with lowercase, number, and special character';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = () => {
    if (!validate()) return;

    registerMutation.mutate(
      { name, email, password },
      {
        onSuccess: () => {
          // Navigate to sign-in after successful registration
          router.replace("/(auth)/sign-in");
        },
        onError: (error) => {
          console.log('Registration failed:', error);
          alert('Registration failed: ' + error.message);
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start your journey with us today!</Text>

        <View style={styles.form}>
          <View style={[styles.inputContainer, errors.name && styles.inputError]}>
            <Ionicons name="person-outline" size={20} color={errors.name ? "#FF3B30" : "#666"} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Full Name" 
              placeholderTextColor="#999"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
            />
          </View>
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <View style={[styles.inputContainer, errors.email && styles.inputError]}>
            <Ionicons name="mail-outline" size={20} color={errors.email ? "#FF3B30" : "#666"} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Email" 
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <View style={[styles.inputContainer, errors.password && styles.inputError]}>
            <Ionicons name="lock-closed-outline" size={20} color={errors.password ? "#FF3B30" : "#666"} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TouchableOpacity 
            style={[styles.button, registerMutation.isPending && styles.buttonDisabled]} 
            onPress={handleSignUp}
            disabled={registerMutation.isPending}
          >
            <Text style={styles.buttonText}>
              {registerMutation.isPending ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -8,
    marginLeft: 4,
    marginBottom: 8,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 24,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
