import MapTab from '@/src/components/common/MapTab';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function MapsScreen() {
  const router = useRouter();

  const handleSelectEquipment = (id: string) => {
    router.push(`/(admin)/records/${id}` as any);
  };

  return (
    <View style={styles.root}>
      <MapTab />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});