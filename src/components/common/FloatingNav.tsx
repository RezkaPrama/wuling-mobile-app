import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export type AdminTab = 'dashboard' | 'maps' | 'equipment' | 'profiles';

interface NavItem {
  id: AdminTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',  label: 'Tasks',    icon: 'calendar-outline',  iconActive: 'calendar' },
  { id: 'equipment',    label: 'Equipment',  icon: 'pulse-outline',     iconActive: 'pulse' },
  { id: 'maps',  label: 'Layout',   icon: 'map-outline',       iconActive: 'map' },
  { id: 'profiles',  label: 'settings',  icon: 'settings-outline',  iconActive: 'settings' },
];

interface FloatingNavProps {
  activeTab: AdminTab;
  onChangeTab: (tab: AdminTab) => void;
}

function NavButton({
  item,
  isActive,
  onPress,
}: {
  item: NavItem;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const bgOpacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(bgOpacity, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  }, [isActive]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.navButton}
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View style={[styles.navButton, { transform: [{ scale }] }]}>
        {/* Red pill background */}
        <Animated.View
          style={[styles.activePill, { opacity: bgOpacity }]}
        />

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name={isActive ? item.iconActive : item.icon}
            size={22}
            color={isActive ? '#FFFFFF' : '#9CA3AF'}
          />
          <Text style={[styles.label, isActive && styles.labelActive]}>
            {item.label}
          </Text>
        </View>

        {/* Yellow dot indicator */}
        {isActive && (
          <View style={styles.dotIndicator} />
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function FloatingNav({ activeTab, onChangeTab }: FloatingNavProps) {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.container}>
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onPress={() => onChangeTab(item.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 50,
  },
  container: {
    height: 68,
    backgroundColor: 'rgba(30, 30, 30, 0.97)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  navButton: {
    width: 64,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    position: 'relative',
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D91E1E',
    borderRadius: 14,
  },
  iconContainer: {
    alignItems: 'center',
    gap: 3,
    zIndex: 1,
  },
  label: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#9CA3AF',
  },
  labelActive: {
    color: '#FFFFFF',
  },
  dotIndicator: {
    position: 'absolute',
    top: 6,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FACC15',
    borderWidth: 1,
    borderColor: '#D91E1E',
    zIndex: 2,
  },
});