import EquipmentTab from '@/src/components/common/EquipmentTab';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function EquipmentScreen() {
  const router = useRouter();

  const handleSelectEquipment = (id: string) => {
    router.push(`/(admin)/records/${id}` as any);
  };

  return (
    <View style={styles.root}>
      <EquipmentTab onSelectEquipment={handleSelectEquipment} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});