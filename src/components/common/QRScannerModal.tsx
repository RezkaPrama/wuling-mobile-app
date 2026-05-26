import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

// ─── Mock Data (sama seperti AI Studio) ───────────────────────────────────────
const MOCK_TARGET_MACHINES = [
  { id: 'PM-20260512-0001', name: 'Friction Roller Bed',  shop: 'Body Shop' },
  { id: 'PM-20260512-0002', name: 'Lifter Main Line',     shop: 'Assembly Shop' },
  { id: 'PM-20260512-0003', name: 'Robot Arm #04',        shop: 'Body Shop' },
  { id: 'PM-20260512-0004', name: 'Conveyor Drive',       shop: 'Paint Shop' },
];

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (id: string) => void;
}

type ScanMethod = 'camera' | 'manual';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
  const [scanMethod, setScanMethod]       = useState<ScanMethod>('camera');
  const [manualId, setManualId]           = useState('');
  const [errorText, setErrorText]         = useState('');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScanning, setIsScanning]       = useState(true); // cegah double scan

  const [permission, requestPermission] = useCameraPermissions();

  // ─── Handle scan sukses ───────────────────────────────────────────────────
  const handleScanSuccess = (id: string) => {
    if (scannedResult) return; // sudah terpicu, abaikan
    setScannedResult(id);
    setIsScanning(false);
    setTimeout(() => {
      onScanSuccess(id);
      onClose();
      // reset state
      setScannedResult(null);
      setManualId('');
      setErrorText('');
      setIsScanning(true);
    }, 1200);
  };

  // ─── QR Code terbaca oleh kamera ──────────────────────────────────────────
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!isScanning || scannedResult) return;
    const cleanId = data.trim().toUpperCase();
    const exists  = MOCK_TARGET_MACHINES.some(m => m.id === cleanId);
    if (exists) {
      handleScanSuccess(cleanId);
    } else {
      setErrorText(`QR tidak dikenali: ${cleanId}`);
      // reset error setelah 2 detik agar bisa scan lagi
      setTimeout(() => setErrorText(''), 2000);
    }
  };

  // ─── Submit manual ────────────────────────────────────────────────────────
  const handleManualSubmit = () => {
    const cleanId = manualId.trim().toUpperCase();
    const exists  = MOCK_TARGET_MACHINES.some(m => m.id === cleanId);
    if (exists) {
      setErrorText('');
      handleScanSuccess(cleanId);
    } else {
      setErrorText('ID Mesin tidak ditemukan! Gunakan ID yang valid.');
    }
  };

  // ─── Simulasi scan (tombol mesin) ─────────────────────────────────────────
  const simulateScan = (id: string) => handleScanSuccess(id);

  // ─── Reset saat modal ditutup ─────────────────────────────────────────────
  const handleClose = () => {
    setScannedResult(null);
    setManualId('');
    setErrorText('');
    setIsScanning(true);
    setScanMethod('camera');
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.sheet}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBadge}>
                <Ionicons name="qr-code-outline" size={18} color="#D91E1E" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Industrial QR Scanner</Text>
                <Text style={styles.headerSub}>WULING MACHINERY</Text>
              </View>
            </View>
            <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </Pressable>
          </View>

          {/* ── Tab Pills ── */}
          <View style={styles.tabBar}>
            {(['camera', 'manual'] as ScanMethod[]).map(method => (
              <Pressable
                key={method}
                style={[styles.tabBtn, scanMethod === method && styles.tabBtnActive]}
                onPress={() => { setScanMethod(method); setErrorText(''); }}
              >
                <Ionicons
                  name={method === 'camera' ? 'camera-outline' : 'keypad-outline'}
                  size={14}
                  color={scanMethod === method ? '#D91E1E' : '#9CA3AF'}
                />
                <Text style={[styles.tabLabel, scanMethod === method && styles.tabLabelActive]}>
                  {method === 'camera' ? 'Kamera' : 'Input Manual'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ── Konten ── */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* ── State: Sukses ── */}
            {scannedResult ? (
              <View style={styles.successBox}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={52} color="#22C55E" />
                </View>
                <Text style={styles.successTitle}>QR Berhasil Dikenali</Text>
                <Text style={styles.successSub}>Mengalihkan ke formulir pengerjaan...</Text>
                <View style={styles.successId}>
                  <Text style={styles.successIdText}>{scannedResult}</Text>
                </View>
              </View>

            ) : scanMethod === 'camera' ? (
              /* ── Mode Kamera ── */
              <View style={styles.cameraSection}>

                {/* Viewport kamera */}
                {!permission ? (
                  <View style={styles.cameraPlaceholder}>
                    <ActivityIndicator color="#D91E1E" />
                  </View>
                ) : !permission.granted ? (
                  <View style={styles.cameraPlaceholder}>
                    <Ionicons name="camera-outline" size={36} color="#6B7280" />
                    <Text style={styles.permText}>Izin kamera diperlukan</Text>
                    <Pressable style={styles.permBtn} onPress={requestPermission}>
                      <Text style={styles.permBtnText}>Izinkan Kamera</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.cameraWrapper}>
                    <CameraView
                      style={styles.camera}
                      facing="back"
                      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                      onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
                    />
                    {/* Corner guides */}
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                    {/* Label */}
                    <View style={styles.cameraLabel}>
                      <View style={styles.liveDot} />
                      <Text style={styles.cameraLabelText}>LIVE SCAN</Text>
                    </View>
                  </View>
                )}

                {/* Error scan */}
                {errorText ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle-outline" size={14} color="#DC2626" />
                    <Text style={styles.errorText}>{errorText}</Text>
                  </View>
                ) : null}

                {/* Simulasi mesin */}
                <Text style={styles.simLabel}>SIMULASI SCAN MESIN:</Text>
                <View style={styles.machineGrid}>
                  {MOCK_TARGET_MACHINES.map(m => (
                    <Pressable
                      key={m.id}
                      style={({ pressed }) => [styles.machineCard, pressed && styles.machineCardPressed]}
                      onPress={() => simulateScan(m.id)}
                    >
                      <Text style={styles.machineId}>{m.id}</Text>
                      <Text style={styles.machineName}>{m.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

            ) : (
              /* ── Mode Manual ── */
              <View style={styles.manualSection}>
                <Text style={styles.inputLabel}>MASUKKAN ID INSPEKSI (PM CODE)</Text>
                <TextInput
                  style={styles.textInput}
                  value={manualId}
                  onChangeText={text => { setManualId(text); setErrorText(''); }}
                  placeholder="Contoh: PM-20260512-0001"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                  autoCorrect={false}
                />

                {errorText ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle-outline" size={14} color="#DC2626" />
                    <Text style={styles.errorText}>{errorText}</Text>
                  </View>
                ) : null}

                {/* Daftar kode valid */}
                <View style={styles.validList}>
                  <Text style={styles.validListLabel}>VALID PM CODES:</Text>
                  {MOCK_TARGET_MACHINES.map(m => (
                    <Pressable
                      key={m.id}
                      style={({ pressed }) => [styles.validItem, pressed && styles.validItemPressed]}
                      onPress={() => { setManualId(m.id); setErrorText(''); }}
                    >
                      <Text style={styles.validItemId}>{m.id}</Text>
                      <Text style={styles.validItemName}>{m.name}</Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed]}
                  onPress={handleManualSubmit}
                >
                  <Text style={styles.submitBtnText}>Buka Checklist ID</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '90%',        // ← pakai height, bukan maxHeight
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  headerSub:   { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1 },
  closeBtn: {
    padding: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },

  // Tab
  tabBar: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabBtnActive: { backgroundColor: '#fff' },
  tabLabel:       { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  tabLabelActive: { color: '#D91E1E' },

  // Body
  body: { flex: 1 },
  bodyContent: { padding: 16, paddingTop: 0 },

  // Sukses
  successBox: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  successIcon: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#BBF7D0',
    marginBottom: 8,
  },
  successTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  successSub:   { fontSize: 12, color: '#6B7280', marginTop: 4 },
  successId: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1, borderColor: '#FECACA',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 10, marginTop: 8,
  },
  successIdText: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 14, fontWeight: '700', color: '#D91E1E' },

  // Kamera
  cameraSection: { gap: 16 },
  cameraPlaceholder: {
    height: 200,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    gap: 12,
  },
  permText:    { color: '#9CA3AF', fontSize: 13 },
  permBtn:     { backgroundColor: '#D91E1E', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cameraWrapper: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
    position: 'relative',
  },
  camera: { flex: 1 },

  // Corner guides
  corner: { position: 'absolute', width: 20, height: 20 },
  cornerTL: { top: 12, left: 12, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderColor: '#D91E1E', borderTopLeftRadius: 4 },
  cornerTR: { top: 12, right: 12, borderTopWidth: 2.5, borderRightWidth: 2.5, borderColor: '#D91E1E', borderTopRightRadius: 4 },
  cornerBL: { bottom: 12, left: 12, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderColor: '#D91E1E', borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 12, right: 12, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderColor: '#D91E1E', borderBottomRightRadius: 4 },

  cameraLabel: {
    position: 'absolute', top: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  cameraLabelText: { fontSize: 9, fontWeight: '700', color: '#fff', letterSpacing: 1 },

  // Simulasi
  simLabel: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1.2 },
  machineGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  machineCard: {
    width: '48%',
    padding: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1, borderColor: '#DBEAFE',
    borderRadius: 12,
  },
  machineCardPressed: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  machineId:   { fontSize: 9, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '700', color: '#6B7280' },
  machineName: { fontSize: 12, fontWeight: '700', color: '#1F2937', marginTop: 2 },

  // Error
  errorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1, borderColor: '#FECACA',
    padding: 10, borderRadius: 10,
  },
  errorText: { flex: 1, fontSize: 12, color: '#DC2626', lineHeight: 18 },

  // Manual
  manualSection: { gap: 14 },
  inputLabel: { fontSize: 10, fontWeight: '700', color: '#6B7280', letterSpacing: 1 },
  textInput: {
    borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, fontWeight: '600', color: '#111827',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  validList: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, padding: 12, gap: 4,
  },
  validListLabel: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1.2, marginBottom: 4 },
  validItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8,
  },
  validItemPressed: { backgroundColor: '#F3F4F6' },
  validItemId:   { fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '700', color: '#374151' },
  validItemName: { fontSize: 10, color: '#9CA3AF' },

  submitBtn: {
    backgroundColor: '#D91E1E',
    paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', marginTop: 4,
  },
  submitBtnPressed: { backgroundColor: '#B91C1C' },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});