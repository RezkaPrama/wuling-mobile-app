import FloatingNav, { AdminTab } from '@/src/components/common/FloatingNav';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

// Mapping: path segment → AdminTab
const SEGMENT_TO_TAB: Record<string, AdminTab> = {
  dashboard:  'dashboard',
  maps:       'maps',
  equipment:  'equipment',
  profiles:   'profiles',
};

function getActiveTab(pathname: string): AdminTab {
  // pathname contoh: "/(admin)/dashboard" atau "/(admin)/records/from-qr"
  const segments = pathname.split('/').filter(Boolean);
  // segments[0] = "(admin)", segments[1] = "dashboard" dst.
  const seg = segments[1] ?? 'dashboard';
  return SEGMENT_TO_TAB[seg] ?? 'dashboard';
}

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  const handleChangeTab = useCallback((tab: AdminTab) => {
    switch (tab) {
      case 'dashboard':
        router.push('/(admin)/dashboard' as any);
        break;
      case 'equipment':
        router.push('/(admin)/equipment' as any);
        break;
      case 'maps':
        router.push('/(admin)/maps' as any);
        break;
      case 'profiles':
        router.push('/(admin)/profiles' as any);
        break;
    }
  }, [router]);

  return (
    <View style={styles.root}>
      {/* Tabs dengan tab bar bawaan disembunyikan */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.hiddenTabBar, // ← sembunyikan tab bar native
        }}
      >
        <Tabs.Screen name="dashboard" />
        <Tabs.Screen name="records" />
        <Tabs.Screen name="equipment" />
        <Tabs.Screen name="schedules" />
        <Tabs.Screen name="logout" options={{ href: null }} />
      </Tabs>

      {/* Floating nav custom */}
      <FloatingNav activeTab={activeTab} onChangeTab={handleChangeTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hiddenTabBar: {
    display: 'none',       // sembunyikan tab bar bawaan Expo
    height: 0,
    position: 'absolute',
  },
});