import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LayoutChangeEvent } from 'react-native';
import type { Route } from '@react-navigation/native';

// Spring animation settings for the sliding indicator.
// damping: higher = less wobble/overshoot, settles faster (try 20-30 for a calm, no-bounce feel)
// stiffness: higher = snappier/faster start (try 150-300)
// mass: higher = slower, heavier-feeling motion (default 1)
const SPRING_CONFIG = {
  damping: 26,
  stiffness: 220,
  mass: 0.9,
};

// Map each route name to an icon (outline = inactive, filled = active)
const ICONS: Record<string, { active: "wallet" | "cog"; inactive: "wallet" | "cog" }> = {
      index: { active: 'wallet', inactive: 'wallet' },
      profile: { active: 'cog', inactive: 'cog' },
    };

interface TabLayout {
  x: number;
  width: number;
}

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Store each tab's x position + width so the indicator knows where to animate to
  const [layouts, setLayouts] = useState<Record<number, TabLayout>>({});

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const handleTabLayout = (event: LayoutChangeEvent, index: number) => {
    const { x, width } = event.nativeEvent.layout;
    setLayouts((prev) => {
      const updated = { ...prev, [index]: { x, width } };

      // If this is the currently focused tab's layout (e.g. on first mount),
      // snap the indicator there immediately without animating from 0.
      if (index === state.index && indicatorWidth.value === 0) {
        indicatorX.value = x;
        indicatorWidth.value = width;
      }
      return updated;
    });
  };

  // Whenever the focused index changes, animate the indicator to that tab's layout
  React.useEffect(() => {
    const target = layouts[state.index];
    if (target) {
      indicatorX.value = withSpring(target.x, SPRING_CONFIG);
      indicatorWidth.value = withSpring(target.width, SPRING_CONFIG);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index, layouts]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 12 }]}>
      <View style={styles.container}>
        {/* Sliding black pill behind the active tab */}
        <Animated.View style={[styles.indicator, indicatorStyle]} />

        {state.routes.map((route: Route<string>, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? String(options.tabBarLabel)
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const iconSet = ICONS[route.name] ?? ICONS.index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLayout={(e) => handleTabLayout(e, index)}
              activeOpacity={0.7}
              style={styles.tab}
            >
              <Ionicons
                name={isFocused ? iconSet.active : iconSet.inactive}
                size={isFocused ? 23 : 23}
                color={isFocused ? "white" : "black"}
              />
              <Text style={[styles.label, { color: isFocused ? "white" : "black", fontWeight: "bold"}]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}


  const styles = StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: 16,
      right: 16,
      alignItems: 'center',
    },
    container: {
      flexDirection: 'row',
      backgroundColor: "white",
      borderRadius: 50,
      paddingVertical: 10,
      paddingHorizontal: 8,
      width: '60%',
      justifyContent: 'space-between',
      // shadow (iOS)
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      // elevation (Android)
      elevation: 12,
    },
    indicator: {
      position: 'absolute',
      top: 6,
      bottom: 6,
      left: 0,
      backgroundColor: "black",
      borderRadius: 50,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingVertical: 4,
      zIndex: 1, // keep icons/labels above the sliding indicator
    },
    label: {
      fontSize: 12,
    },
  });
