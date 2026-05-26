import FloatingNav, { AdminTab } from '@/src/components/common/FloatingNav';
import { Tabs, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function AdminLayout() {
  const router = useRouter();
  
  // State lokal — sumber kebenaran tab aktif
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const handleChangeTab = useCallback((tab: AdminTab) => {
    setActiveTab(tab); // update state dulu, langsung
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
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.hiddenTabBar,
        }}
      >
        <Tabs.Screen name="dashboard" />
        <Tabs.Screen name="records" />
        <Tabs.Screen name="equipment" />
        <Tabs.Screen name="schedules" />
        <Tabs.Screen name="logout" options={{ href: null }} />
      </Tabs>

      <FloatingNav activeTab={activeTab} onChangeTab={handleChangeTab} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hiddenTabBar: {
    display: 'none',
    height: 0,
    position: 'absolute',
  },
});