// app/(admin)/records/from-qr.tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

export default function FromQrScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  const handleScan = ({ data }: { data: string }) => {
    // data = equipment_id dari QR code
    router.push(`/(admin)/records/create?equipment_id=${data}`);
  };

  return (
    <CameraView
      style={{ flex: 1 }}
      facing="back"
      onBarcodeScanned={handleScan}
      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
    />
  );
}