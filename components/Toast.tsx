import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useToast } from '../context/ToastContext';

const TOAST_HEIGHT = 60;

export const Toast = () => {
  const { toast, visible, hideToast } = useToast();
  const translateY = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 20, // Floating margin from top
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!toast) return null;

  const getAccentColor = () => {
    switch (toast.type) {
      case 'success': return '#66BB6A';
      case 'error': return '#EF5350';
      case 'warning': return '#FFA726';
      default: return '#42A5F5';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY }] }
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.toastCard}>
          {/* Left Indicator Strip */}
          <View style={[styles.indicator, { backgroundColor: getAccentColor() }]} />
          
          <View style={styles.content}>
            <View style={[styles.iconContainer]}>
              <Ionicons name={getIcon() as any} size={28} color={getAccentColor()} />
            </View>
            
            <Text style={styles.text}>{toast.message}</Text>
            
            <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight : 10,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  safeArea: {
    width: '100%',
  },
  toastCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 70,
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  indicator: {
    width: 6,
    height: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 10,
  },
  iconContainer: {
    marginRight: 12,
  },
  text: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  }
});
