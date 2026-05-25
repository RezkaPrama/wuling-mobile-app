import SettingsTab from '@/src/components/common/SettingsTab';
import { StyleSheet, View } from 'react-native';

export default function SchedulesScreen() {
  return (
    <View style={styles.root}>
      <SettingsTab />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});