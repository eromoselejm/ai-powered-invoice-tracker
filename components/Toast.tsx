import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';

const Toast = ({ 
  text = 'Toast message', 
  duration = 3000, 
  isDark = true,
  onDismiss = () => {} 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 200,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, fadeAnim, slideAnim, onDismiss]);

  const styles = getStyles(isDark);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.toast}>
        <Text style={styles.text} numberOfLines={2}>
          {text}
        </Text>
      </View>
    </Animated.View>
  );
};

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 120,
      alignSelf: 'center',
      width: '90%',
      maxWidth: 400,
    },
    toast: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 1,
      borderColor: isDark ? '#333333' : '#e0e0e0',
    },
    text: {
      color: isDark ? '#ffffff' : '#1a1a1a',
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
  });

export default Toast;