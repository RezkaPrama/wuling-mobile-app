import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
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
  { id: 'dashboard', label: 'Tasks', icon: 'calendar-outline', iconActive: 'calendar' },
  { id: 'equipment', label: 'Equipment', icon: 'pulse-outline', iconActive: 'pulse' },
  { id: 'maps', label: 'Layout', icon: 'map-outline', iconActive: 'map' },
  { id: 'profiles', label: 'Settings', icon: 'settings-outline', iconActive: 'settings' },
];

const TAB_WIDTH = 72;
const TAB_HEIGHT = 54;
const TAB_GAP = 4;
const NAV_PADDING = 8;

function getPillX(index: number): number {
  return NAV_PADDING + index * (TAB_WIDTH + TAB_GAP);
}

interface FloatingNavProps {
  activeTab: AdminTab;
  onChangeTab: (tab: AdminTab) => void;
}

export default function FloatingNav({ activeTab, onChangeTab }: FloatingNavProps) {
  const activeIndex = NAV_ITEMS.findIndex(item => item.id === activeTab);
  const [containerWidth, setContainerWidth] = useState(0);

  // Hitung TAB_WIDTH dinamis dari lebar container sebenarnya
  const dynamicTabWidth = containerWidth > 0
    ? (containerWidth - NAV_PADDING * 2 - TAB_GAP * (NAV_ITEMS.length - 1)) / NAV_ITEMS.length
    : TAB_WIDTH;

  const pillX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (containerWidth === 0) return; // tunggu layout selesai

    const targetX = NAV_PADDING + activeIndex * (dynamicTabWidth + TAB_GAP);
    console.log('moving pill to:', targetX, 'containerWidth:', containerWidth);

    Animated.spring(pillX, {
      toValue: targetX,
      useNativeDriver: false,
      stiffness: 380,
      damping: 30,
      mass: 1,
    }).start();
  }, [activeIndex, containerWidth]);

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View
        style={styles.container}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)} // ← ukur lebar real
      >
        <Animated.View
          style={[
            styles.slidingPill,
            {
              width: dynamicTabWidth,    // ← lebar pill ikut container
              transform: [{ translateX: pillX }],
            },
          ]}
        />

        {NAV_ITEMS.map((item, index) => {
          const isActive = activeTab === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onChangeTab(item.id)}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: isActive }}
              style={[styles.tabPressable, { width: dynamicTabWidth }]} // ← lebar tab ikut
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={isActive ? item.iconActive : item.icon}
                  size={22}
                  color={isActive ? '#FFFFFF' : '#9CA3AF'}
                />
                <Text style={[styles.label, isActive && styles.labelActive]}>
                  {item.label}
                </Text>
                {isActive && <View style={styles.dotIndicator} />}
              </View>
            </Pressable>
          );
        })}
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
    height: 70,
    backgroundColor: 'rgba(30, 30, 30, 0.97)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: NAV_PADDING,
    gap: TAB_GAP,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  slidingPill: {
    position: 'absolute',
    top: 8,
    left: 0,          // titik awal, translateX yang menggeser
    width: TAB_WIDTH,
    height: TAB_HEIGHT,
    backgroundColor: '#D91E1E',
    borderRadius: 14,
  },
  tabPressable: {
    width: TAB_WIDTH,
    height: TAB_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
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
    top: -16,
    right: -18,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FACC15',
    borderWidth: 1,
    borderColor: '#D91E1E',
    zIndex: 2,
  },
});