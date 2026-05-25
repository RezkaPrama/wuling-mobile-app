// app/(admin)/records/[id].tsx
import MaintenanceWorkScreen from '@/src/screens/MaintenanceWorkScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function RecordDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();

  return (
    <MaintenanceWorkScreen
      recordId={Number(id)}
      onGoBack={() => router.back()}
    />
  );
}