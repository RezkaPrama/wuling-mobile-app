import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Types ─────────────────────────────────────────────────────────────────────
type ItemStatus = 'pending' | 'ok' | 'ng' | 'na';

interface PmType {
  key: string;
  label: string;
  icon: string;
}

interface RecordItem {
  id: number;
  item_number: number;
  sub_equipment: string;
  check_item: string;
  maintenance_standard: string;
  pm_types: string[];        // dari template (wajib)
  man_power: number;
  time_minutes: number;
  // state lokal
  status: ItemStatus;
  remarks: string;
  measurement: string;
  actual_man_power: string;
  actual_time_minutes: string;
  requires_action: boolean;
  action_required: string;
  done_pm_types: string[];   // yang sudah dicentang teknisi
  photos: string[];
}

interface RecordDetail {
  id: number;
  record_number: string;
  equipment_name: string;
  equipment_code: string;
  etm_group: string;
  pm_cycle: string;
  template_name: string;
  doc_number: string;
  maintenance_date: string;
  start_time: string;
  technician_name: string;
  checker_name: string | null;
  items: RecordItem[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const PM_TYPES: PmType[] = [
  { key: 'Check',     label: 'CHECK',   icon: '✓' },
  { key: 'Lubricate', label: 'LUBE',    icon: '💧' },
  { key: 'Cleaning',  label: 'CLEAN',   icon: '🧹' },
  { key: 'Tighten',   label: 'TIGHT',   icon: '🔩' },
  { key: 'Measure',   label: 'MEAS',    icon: '📏' },
  { key: 'Replace',   label: 'REPL',    icon: '🔄' },
];

const colors = {
  primary:     '#D91E1E',
  primaryLight:'#FEE2E2',
  ok:          '#10B981',
  okLight:     '#D1FAE5',
  ng:          '#EF4444',
  ngLight:     '#FEE2E2',
  na:          '#9CA3AF',
  naLight:     '#F3F4F6',
  warning:     '#F59E0B',
  warningLight:'#FEF3C7',
  blue:        '#3B82F6',
  blueLight:   '#EFF6FF',
  bg:          '#F9FAFB',
  card:        '#FFFFFF',
  border:      '#E5E7EB',
  text:        '#111827',
  subtext:     '#6B7280',
  disabled:    '#9CA3AF',
};

// ── Mock Data (ganti dengan API call nyata) ───────────────────────────────────
const MOCK_RECORD: RecordDetail = {
  id: 1,
  record_number:   'PM-20260516-0001',
  equipment_name:  'Friction Roller Bed',
  equipment_code:  'BD-BDC-FRB-01/50',
  etm_group:       'Body Shop',
  pm_cycle:        '3m',
  template_name:   'FRB 3-Monthly PM',
  doc_number:      'DOC-FRB-001',
  maintenance_date:'2026-05-16',
  start_time:      '08:00',
  technician_name: 'Ahmad Fauzi',
  checker_name:    null,
  items: [
    {
      id: 1, item_number: 1, sub_equipment: 'Drive Unit FRB',
      check_item: 'Baut drive motor',
      maintenance_standard: 'Baut penahan motor kencang, fan motor bersih dan snapping terkunci dengan benar.',
      pm_types: ['Check', 'Cleaning', 'Tighten'],
      man_power: 2, time_minutes: 30,
      status: 'pending', remarks: '', measurement: '',
      actual_man_power: '', actual_time_minutes: '',
      requires_action: false, action_required: '',
      done_pm_types: [], photos: [],
    },
    {
      id: 2, item_number: 2, sub_equipment: 'Drive Unit FRB',
      check_item: 'Ukur karak spring balancing',
      maintenance_standard: 'Jarak spring balancing 42±5 mm',
      pm_types: ['Check', 'Measure'],
      man_power: 1, time_minutes: 15,
      status: 'pending', remarks: '', measurement: '',
      actual_man_power: '', actual_time_minutes: '',
      requires_action: false, action_required: '',
      done_pm_types: [], photos: [],
    },
    {
      id: 3, item_number: 3, sub_equipment: 'General',
      check_item: 'Kekencangan baut mechanical lock',
      maintenance_standard: 'Standar kekencangan baut mechanical lock 16 Nm.',
      pm_types: ['Check', 'Tighten'],
      man_power: 1, time_minutes: 20,
      status: 'pending', remarks: '', measurement: '',
      actual_man_power: '', actual_time_minutes: '',
      requires_action: false, action_required: '',
      done_pm_types: [], photos: [],
    },
    {
      id: 4, item_number: 4, sub_equipment: 'General',
      check_item: 'Kondisi oli gearbox',
      maintenance_standard: 'Level oli berada di antara MIN dan MAX. Warna oli tidak hitam pekat.',
      pm_types: ['Check', 'Lubricate'],
      man_power: 1, time_minutes: 10,
      status: 'pending', remarks: '', measurement: '',
      actual_man_power: '', actual_time_minutes: '',
      requires_action: false, action_required: '',
      done_pm_types: [], photos: [],
    },
  ],
};

// ── Progress calculation ──────────────────────────────────────────────────────
function calcProgress(items: RecordItem[]) {
  const total   = items.length;
  const done    = items.filter(i => i.status !== 'pending').length;
  const ok      = items.filter(i => i.status === 'ok').length;
  const ng      = items.filter(i => i.status === 'ng').length;
  const na      = items.filter(i => i.status === 'na').length;
  const pending = items.filter(i => i.status === 'pending').length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, ok, ng, na, pending, percent };
}

// ── PM Type Chip ──────────────────────────────────────────────────────────────
function PmTypeChip({
  pmType, isPlan, isDone, isSkipped, onToggle,
}: {
  pmType: PmType; isPlan: boolean; isDone: boolean;
  isSkipped: boolean; onToggle: () => void;
}) {
  let bg     = '#F3F4F6';
  let border = colors.border;
  let txt    = colors.disabled;
  let icon   = pmType.icon;

  if (!isPlan && !isDone) { bg = '#FFF'; border = colors.border; txt = '#D1D5DB'; }
  else if (isSkipped)     { bg = '#FFF0F3'; border = '#F1416C'; txt = '#F1416C'; icon = '!'; }
  else if (isDone && isPlan) { bg = '#E0F5FF'; border = '#009EF7'; txt = '#009EF7'; }
  else if (isDone && !isPlan){ bg = '#FFF8E0'; border = '#FFC107'; txt = '#D07800'; }
  else if (isPlan && !isDone){ bg = '#F5F5F5'; border = '#B5B5C3'; txt = '#7E8299'; }

  if (!isPlan) return null; // hanya tampilkan yang plan

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[pmChipStyles.wrap, { backgroundColor: bg, borderColor: border }]}
      activeOpacity={0.75}
    >
      <Text style={[pmChipStyles.icon, { color: txt }]}>{isDone ? '✓' : icon}</Text>
      <Text style={[pmChipStyles.label, { color: txt }]}>{pmType.label}</Text>
    </TouchableOpacity>
  );
}

const pmChipStyles = StyleSheet.create({
  wrap: {
    borderWidth: 1.5, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 5,
    alignItems: 'center', minWidth: 46,
  },
  icon:  { fontSize: 13, fontWeight: '700' },
  label: { fontSize: 8, fontWeight: '800', marginTop: 2, letterSpacing: 0.5 },
});

// ── Status Buttons ────────────────────────────────────────────────────────────
function StatusButtons({
  status, onChange,
}: { status: ItemStatus; onChange: (s: ItemStatus) => void }) {
  const btns: { key: ItemStatus; label: string; active: string; text: string }[] = [
    { key: 'ok', label: 'OK', active: colors.ok,      text: '#fff' },
    { key: 'ng', label: 'NG', active: colors.ng,      text: '#fff' },
    { key: 'na', label: 'N/A',active: colors.na,      text: '#fff' },
  ];
  return (
    <View style={statusStyles.row}>
      {btns.map(b => {
        const isActive = status === b.key;
        return (
          <TouchableOpacity
            key={b.key}
            onPress={() => onChange(b.key)}
            style={[
              statusStyles.btn,
              isActive
                ? { backgroundColor: b.active, borderColor: b.active }
                : { borderColor: b.active },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[statusStyles.txt, { color: isActive ? b.text : b.active }]}>
              {b.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const statusStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1, paddingVertical: 10,
    borderWidth: 2, borderRadius: 10,
    alignItems: 'center',
  },
  txt: { fontSize: 13, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});

// ── Check Item Card ───────────────────────────────────────────────────────────
function CheckItemCard({
  item, recordId, onUpdate,
}: {
  item: RecordItem;
  recordId: number;
  onUpdate: (id: number, patch: Partial<RecordItem>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMeasure = item.pm_types.includes('Measure');

  function togglePmType(key: string) {
    const done = item.done_pm_types.includes(key)
      ? item.done_pm_types.filter(k => k !== key)
      : [...item.done_pm_types, key];
    onUpdate(item.id, { done_pm_types: done });
  }

  function getStatusColor() {
    if (item.status === 'ok') return colors.ok;
    if (item.status === 'ng') return colors.ng;
    if (item.status === 'na') return colors.na;
    return colors.border;
  }

  const skippedPlan = item.pm_types.filter(p => !item.done_pm_types.includes(p));
  const hasSkipped  = skippedPlan.length > 0 && item.status !== 'pending';

  return (
    <View style={[itemStyles.card, { borderLeftColor: getStatusColor() }]}>
      {/* ── Card Header ── */}
      <View style={itemStyles.cardHead}>
        <View style={itemStyles.numBadge}>
          <Text style={itemStyles.numText}>{item.item_number}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={itemStyles.checkName}>{item.check_item}</Text>
          <Text style={itemStyles.subEquip}>{item.sub_equipment}</Text>
        </View>
        {item.status !== 'pending' && (
          <View style={[itemStyles.statusPill, { backgroundColor: getStatusColor() + '20', borderColor: getStatusColor() }]}>
            <Text style={[itemStyles.statusPillTxt, { color: getStatusColor() }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* ── Standard ── */}
      <View style={itemStyles.standardBox}>
        <Text style={itemStyles.standardLabel}>⚙ STANDAR</Text>
        <Text style={itemStyles.standardText}>"{item.maintenance_standard}"</Text>
      </View>

      {/* ── PM Types ── */}
      <View style={itemStyles.section}>
        <Text style={itemStyles.sectionLabel}>TECHNICIAN ACTIONS</Text>
        <View style={itemStyles.pmRow}>
          {PM_TYPES.filter(p => item.pm_types.includes(p.key)).map(p => (
            <PmTypeChip
              key={p.key}
              pmType={p}
              isPlan={item.pm_types.includes(p.key)}
              isDone={item.done_pm_types.includes(p.key)}
              isSkipped={item.status !== 'pending' && !item.done_pm_types.includes(p.key)}
              onToggle={() => togglePmType(p.key)}
            />
          ))}
        </View>
        {hasSkipped && (
          <View style={itemStyles.skipWarn}>
            <Text style={itemStyles.skipWarnTxt}>
              ⚠ {skippedPlan.length} PM Type belum dicentang
            </Text>
          </View>
        )}
      </View>

      {/* ── Work Time ── */}
      <View style={itemStyles.section}>
        <Text style={itemStyles.sectionLabel}>WORK TIME (PLAN → AKTUAL)</Text>
        <View style={itemStyles.timeRow}>
          <View style={itemStyles.timeCol}>
            <Text style={itemStyles.timePlanLabel}>Man Power Plan</Text>
            <Text style={itemStyles.timePlanVal}>{item.man_power} org</Text>
            <TextInput
              style={itemStyles.timeInput}
              placeholder="aktual"
              placeholderTextColor={colors.disabled}
              keyboardType="numeric"
              value={item.actual_man_power}
              onChangeText={v => onUpdate(item.id, { actual_man_power: v })}
            />
          </View>
          <View style={[itemStyles.timeCol, { flex: 1.2 }]}>
            <Text style={itemStyles.timePlanLabel}>Time Plan</Text>
            <Text style={itemStyles.timePlanVal}>{item.time_minutes} mnt</Text>
            <TextInput
              style={itemStyles.timeInput}
              placeholder="aktual (mnt)"
              placeholderTextColor={colors.disabled}
              keyboardType="numeric"
              value={item.actual_time_minutes}
              onChangeText={v => onUpdate(item.id, { actual_time_minutes: v })}
            />
          </View>
        </View>
      </View>

      {/* ── Measurement (if applicable) ── */}
      {hasMeasure && (
        <View style={itemStyles.section}>
          <Text style={itemStyles.sectionLabel}>NILAI UKUR</Text>
          <TextInput
            style={itemStyles.measInput}
            placeholder="Masukkan nilai pengukuran..."
            placeholderTextColor={colors.disabled}
            value={item.measurement}
            onChangeText={v => onUpdate(item.id, { measurement: v })}
          />
        </View>
      )}

      {/* ── Status Buttons ── */}
      <View style={itemStyles.section}>
        <Text style={itemStyles.sectionLabel}>HASIL PEMERIKSAAN</Text>
        <StatusButtons
          status={item.status}
          onChange={s => onUpdate(item.id, { status: s })}
        />
      </View>

      {/* ── Remarks ── */}
      <View style={itemStyles.section}>
        <Text style={itemStyles.sectionLabel}>KETERANGAN / REMARKS</Text>
        <TextInput
          style={itemStyles.remarksInput}
          placeholder="Keterangan tambahan..."
          placeholderTextColor={colors.disabled}
          value={item.remarks}
          onChangeText={v => onUpdate(item.id, { remarks: v })}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* ── Action Buttons ── */}
      <View style={itemStyles.actionRow}>
        <TouchableOpacity
          style={itemStyles.actionBtn}
          onPress={() => Alert.alert('Foto', 'Fitur upload foto akan segera tersedia.')}
        >
          <Text style={itemStyles.actionBtnIcon}>📷</Text>
          <Text style={itemStyles.actionBtnTxt}>Foto{item.photos.length > 0 ? ` (${item.photos.length})` : ''}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[itemStyles.actionBtn, item.requires_action && itemStyles.actionBtnActive]}
          onPress={() => {
            const next = !item.requires_action;
            onUpdate(item.id, { requires_action: next });
            if (next) setExpanded(true);
          }}
        >
          <Text style={itemStyles.actionBtnIcon}>⚠️</Text>
          <Text style={[itemStyles.actionBtnTxt, item.requires_action && { color: colors.warning }]}>
            Tindakan{item.requires_action ? ' (aktif)' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Action Required Input ── */}
      {item.requires_action && (
        <View style={itemStyles.actionDetail}>
          <Text style={itemStyles.actionDetailLabel}>⚠ TINDAKAN YANG DIPERLUKAN</Text>
          <TextInput
            style={itemStyles.actionInput}
            placeholder="Deskripsikan tindakan lanjut..."
            placeholderTextColor={colors.disabled}
            value={item.action_required}
            onChangeText={v => onUpdate(item.id, { action_required: v })}
            multiline
          />
        </View>
      )}
    </View>
  );
}

const itemStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderLeftWidth: 4,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    padding: 16,
  },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  numBadge: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  numText:      { color: '#fff', fontSize: 12, fontWeight: '800' },
  checkName:    { fontSize: 14, fontWeight: '700', color: colors.text, lineHeight: 19 },
  subEquip:     { fontSize: 10, color: colors.disabled, marginTop: 2, fontWeight: '500' },
  statusPill: {
    borderWidth: 1.5, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  statusPillTxt:{ fontSize: 10, fontWeight: '800' },

  standardBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#BFDBFE',
    marginBottom: 14,
  },
  standardLabel:{ fontSize: 9, fontWeight: '800', color: '#3B82F6', letterSpacing: 0.8, marginBottom: 4 },
  standardText: { fontSize: 12, color: '#1E40AF', fontStyle: 'italic', lineHeight: 17 },

  section:       { marginBottom: 14 },
  sectionLabel:  { fontSize: 9, fontWeight: '800', color: colors.disabled, letterSpacing: 0.8, marginBottom: 8 },

  pmRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skipWarn: {
    marginTop: 8, backgroundColor: '#FFF0F3',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
  },
  skipWarnTxt:  { fontSize: 10, color: '#F1416C', fontWeight: '600' },

  timeRow: { flexDirection: 'row', gap: 10 },
  timeCol: { flex: 1 },
  timePlanLabel:{ fontSize: 9, fontWeight: '600', color: colors.disabled, marginBottom: 2 },
  timePlanVal:  { fontSize: 12, fontWeight: '700', color: colors.subtext, marginBottom: 5 },
  timeInput: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7,
    fontSize: 13, fontWeight: '700', color: colors.text,
    backgroundColor: '#F8F9FF', textAlign: 'center',
  },

  measInput: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
    fontSize: 13, color: colors.text, backgroundColor: '#F8F9FF',
  },

  remarksInput: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
    fontSize: 13, color: colors.text, minHeight: 60, textAlignVertical: 'top',
  },

  actionRow:    { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 10, paddingVertical: 10,
  },
  actionBtnActive:{ borderColor: colors.warning, backgroundColor: '#FFFBEB' },
  actionBtnIcon: { fontSize: 14 },
  actionBtnTxt:  { fontSize: 12, fontWeight: '700', color: colors.subtext },

  actionDetail: {
    marginTop: 12, backgroundColor: '#FFFBEB',
    borderRadius: 10, padding: 10,
    borderWidth: 1.5, borderColor: '#FDE68A',
  },
  actionDetailLabel:{ fontSize: 9, fontWeight: '800', color: colors.warning, letterSpacing: 0.8, marginBottom: 6 },
  actionInput: {
    borderWidth: 1, borderColor: '#FCD34D',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
    fontSize: 13, color: colors.text, backgroundColor: '#FFFEF0',
    minHeight: 48, textAlignVertical: 'top',
  },
});

// ── Sub Equipment Section Header ──────────────────────────────────────────────
function SectionHeader({ title, count, done }: { title: string; count: number; done: number }) {
  return (
    <View style={sectionHStyles.wrap}>
      <View style={sectionHStyles.left}>
        <View style={sectionHStyles.iconWrap}>
          <Text style={{ fontSize: 12 }}>⚙️</Text>
        </View>
        <Text style={sectionHStyles.title}>{title || 'General'}</Text>
      </View>
      <View style={sectionHStyles.badge}>
        <Text style={sectionHStyles.badgeTxt}>{done}/{count}</Text>
      </View>
    </View>
  );
}

const sectionHStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 12, marginTop: 4,
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  left:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconWrap:{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  title:   { fontSize: 13, fontWeight: '800', color: '#3730A3' },
  badge:   { backgroundColor: '#6366F1', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTxt:{ fontSize: 11, fontWeight: '700', color: '#fff' },
});

// ── Complete Modal ────────────────────────────────────────────────────────────
function CompleteModal({
  visible, progress, onConfirm, onCancel, submitting,
}: {
  visible: boolean;
  progress: ReturnType<typeof calcProgress>;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.box}>
          <View style={modalStyles.iconWrap}>
            <Text style={{ fontSize: 36 }}>✅</Text>
          </View>
          <Text style={modalStyles.title}>Selesaikan Pengerjaan PM?</Text>

          {/* Stat row */}
          <View style={modalStyles.statRow}>
            <View style={modalStyles.statItem}>
              <Text style={[modalStyles.statVal, { color: colors.ok }]}>{progress.ok}</Text>
              <Text style={modalStyles.statLabel}>OK</Text>
            </View>
            <View style={modalStyles.statItem}>
              <Text style={[modalStyles.statVal, { color: colors.ng }]}>{progress.ng}</Text>
              <Text style={modalStyles.statLabel}>NG</Text>
            </View>
            <View style={modalStyles.statItem}>
              <Text style={[modalStyles.statVal, { color: colors.na }]}>{progress.na}</Text>
              <Text style={modalStyles.statLabel}>N/A</Text>
            </View>
            <View style={modalStyles.statItem}>
              <Text style={[modalStyles.statVal, { color: colors.warning }]}>{progress.pending}</Text>
              <Text style={modalStyles.statLabel}>Pending</Text>
            </View>
          </View>

          {progress.pending > 0 && (
            <View style={modalStyles.warnBox}>
              <Text style={modalStyles.warnTxt}>
                ⚠ Masih ada {progress.pending} item yang belum diisi. Harap selesaikan semua item sebelum submit.
              </Text>
            </View>
          )}

          <View style={modalStyles.infoBox}>
            <Text style={modalStyles.infoTxt}>
              ℹ Setelah diselesaikan, record akan dikirim ke Checker untuk divalidasi.
            </Text>
          </View>

          <View style={modalStyles.actions}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={modalStyles.cancelTxt}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.confirmBtn, progress.pending > 0 && modalStyles.confirmDisabled]}
              onPress={progress.pending === 0 ? onConfirm : undefined}
              activeOpacity={progress.pending > 0 ? 1 : 0.8}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={modalStyles.confirmTxt}>Ya, Selesaikan PM</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  box:       { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center' },
  iconWrap:  { width: 72, height: 72, borderRadius: 22, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title:     { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 20, textAlign: 'center' },
  statRow:   { flexDirection: 'row', width: '100%', marginBottom: 16, gap: 8 },
  statItem:  { flex: 1, alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingVertical: 12 },
  statVal:   { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 10, color: colors.subtext, fontWeight: '600', marginTop: 2 },
  warnBox:   { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 12, marginBottom: 10, width: '100%', borderWidth: 1, borderColor: '#FDE68A' },
  warnTxt:   { fontSize: 12, color: '#92400E', lineHeight: 18 },
  infoBox:   { backgroundColor: '#F0F9FF', borderRadius: 10, padding: 12, marginBottom: 20, width: '100%' },
  infoTxt:   { fontSize: 12, color: '#0369A1', lineHeight: 18 },
  actions:   { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center' },
  cancelTxt: { fontWeight: '700', color: '#374151', fontSize: 15 },
  confirmBtn:{ flex: 1.5, paddingVertical: 14, borderRadius: 14, backgroundColor: colors.ok, alignItems: 'center' },
  confirmDisabled: { backgroundColor: colors.disabled },
  confirmTxt:{ fontWeight: '700', color: '#fff', fontSize: 15 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
interface Props {
  recordId?: number;
  onGoBack: () => void;
}

export default function MaintenanceWorkScreen({ recordId, onGoBack }: Props) {
  const insets = useSafeAreaInsets();
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [record, setRecord]         = useState<RecordDetail>(MOCK_RECORD);
  const [items, setItems]           = useState<RecordItem[]>(MOCK_RECORD.items);
  const [showComplete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId]     = useState<number | null>(null);

  const progress = calcProgress(items);
  
  const router = useRouter();

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress.percent,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress.percent]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // Group items by sub_equipment
  const grouped = items.reduce<Record<string, RecordItem[]>>((acc, item) => {
    const key = item.sub_equipment || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const handleUpdateItem = useCallback((id: number, patch: Partial<RecordItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
    // TODO: Ganti dengan API call ke PUT /api/maintenance-record/maintenance-records/{recordId}/items/{id}
    setSavingId(id);
    setTimeout(() => setSavingId(null), 1000);
  }, []);

  function handleGoBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(admin)/dashboard');  // fallback jika tidak ada history
    }
  }

  const handleSubmit = () => {
    setSubmitting(true);
    // TODO: API call ke POST /api/maintenance-record/maintenance-dashboard/{recordId}/complete
    setTimeout(() => {
      setSubmitting(false);
      setComplete(false);
      Alert.alert('✅ Berhasil', 'PM berhasil diselesaikan dan dikirim ke Checker.', [
        { text: 'OK', onPress: () => router.replace('/(admin)/dashboard') },
      ]);
    }, 2000);
  };

  const progressColor = progress.percent === 100 ? colors.ok : colors.primary;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Sticky Header ── */}
      <View style={[headerStyles.wrap, { paddingTop: insets.top + 8 }]}>
        {/* Top row */}
        <View style={headerStyles.topRow}>
          <TouchableOpacity style={headerStyles.backBtn} onPress={handleGoBack} activeOpacity={0.8}>
            <Text style={headerStyles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={headerStyles.title} numberOfLines={1}>{record.equipment_name}</Text>
            <Text style={headerStyles.recordNum}>{record.record_number}</Text>
          </View>
          <View style={headerStyles.statusBadge}>
            <Text style={headerStyles.statusTxt}>IN PROGRESS</Text>
          </View>
        </View>

        {/* Info row */}
        <View style={headerStyles.infoRow}>
          <View style={headerStyles.infoCell}>
            <Text style={headerStyles.infoLabel}>Equ. No</Text>
            <Text style={headerStyles.infoVal} numberOfLines={1}>{record.equipment_code}</Text>
          </View>
          <View style={headerStyles.infoCell}>
            <Text style={headerStyles.infoLabel}>ETM Group</Text>
            <Text style={headerStyles.infoVal}>{record.etm_group}</Text>
          </View>
          <View style={headerStyles.infoCell}>
            <Text style={headerStyles.infoLabel}>PM Cycle</Text>
            <Text style={headerStyles.infoVal}>{record.pm_cycle.toUpperCase()}</Text>
          </View>
        </View>

        {/* Progress row */}
        <View style={headerStyles.progressRow}>
          <View style={headerStyles.progressTrack}>
            <Animated.View style={[headerStyles.progressFill, { width: progressWidth, backgroundColor: progressColor }]} />
          </View>
          <Text style={[headerStyles.progressPct, { color: progressColor }]}>{progress.percent}%</Text>
          <Text style={headerStyles.progressDetail}>{progress.done}/{progress.total}</Text>
        </View>

        {/* Stat row */}
        <View style={headerStyles.statRow}>
          <Text style={headerStyles.statOk}>✓ {progress.ok} OK</Text>
          <Text style={headerStyles.statNg}>✗ {progress.ng} NG</Text>
          <Text style={headerStyles.statPending}>◯ {progress.pending} Pending</Text>
          {savingId !== null && (
            <Text style={headerStyles.savingTxt}>● Menyimpan...</Text>
          )}
        </View>
      </View>

      {/* ── Content ── */}
      <ScrollView
        contentContainerStyle={[contentStyles.container, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Check Sheet Header Info */}
        <View style={contentStyles.csHeader}>
          <View style={contentStyles.csHeaderTitle}>
            <Text style={contentStyles.csHeaderTitleTxt}>📋 Preventive Maintenance Check Sheet</Text>
            <View>
              <Text style={contentStyles.csDocLabel}>Doc No</Text>
              <Text style={contentStyles.csDocVal}>{record.doc_number}</Text>
            </View>
          </View>
          <View style={contentStyles.csHeaderGrid}>
            <View style={contentStyles.csCell}>
              <Text style={contentStyles.csCellLabel}>Teknisi</Text>
              <Text style={contentStyles.csCellVal}>{record.technician_name}</Text>
            </View>
            <View style={contentStyles.csCell}>
              <Text style={contentStyles.csCellLabel}>Tanggal</Text>
              <Text style={contentStyles.csCellVal}>{record.maintenance_date}</Text>
            </View>
            <View style={contentStyles.csCell}>
              <Text style={contentStyles.csCellLabel}>Checker</Text>
              <Text style={contentStyles.csCellVal}>{record.checker_name ?? '(menunggu)'}</Text>
            </View>
          </View>
        </View>

        {/* Legend */}
        <View style={contentStyles.legendRow}>
          <View style={[contentStyles.legendDot, { backgroundColor: colors.ok }]} />
          <Text style={contentStyles.legendTxt}>OK</Text>
          <View style={[contentStyles.legendDot, { backgroundColor: colors.ng }]} />
          <Text style={contentStyles.legendTxt}>NG</Text>
          <View style={[contentStyles.legendDot, { backgroundColor: colors.na }]} />
          <Text style={contentStyles.legendTxt}>N/A</Text>
          <Text style={{ color: '#009EF7', fontSize: 10, fontWeight: '700' }}>✓ PM Done</Text>
          <Text style={{ color: '#F1416C', fontSize: 10, fontWeight: '700' }}>! PM Skip</Text>
        </View>

        {/* NG Summary */}
        {progress.ng > 0 && (
          <View style={contentStyles.ngSummary}>
            <Text style={contentStyles.ngSummaryTitle}>
              ⚠ Item NG — {progress.ng} item
            </Text>
            {items.filter(i => i.status === 'ng').map(i => (
              <View key={i.id} style={contentStyles.ngRow}>
                <View style={contentStyles.ngNumBadge}>
                  <Text style={contentStyles.ngNumTxt}>{i.item_number}</Text>
                </View>
                <Text style={contentStyles.ngItemName} numberOfLines={1}>{i.check_item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Grouped Items */}
        {Object.entries(grouped).map(([subEq, groupItems]) => {
          const doneCnt = groupItems.filter(i => i.status !== 'pending').length;
          return (
            <View key={subEq}>
              <SectionHeader title={subEq} count={groupItems.length} done={doneCnt} />
              {groupItems.map(item => (
                <CheckItemCard
                  key={item.id}
                  item={item}
                  recordId={record.id}
                  onUpdate={handleUpdateItem}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* ── Footer ── */}
      <View style={[footerStyles.wrap, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={footerStyles.draftBtn} activeOpacity={0.8}>
          <Text style={footerStyles.draftIcon}>💾</Text>
          <Text style={footerStyles.draftTxt}>Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            footerStyles.submitBtn,
            progress.percent < 100 && footerStyles.submitBtnDisabled,
          ]}
          onPress={() => setComplete(true)}
          activeOpacity={progress.percent < 100 ? 1 : 0.85}
        >
          <Text style={footerStyles.submitIcon}>✅</Text>
          <Text style={footerStyles.submitTxt}>
            Submit PM · {progress.percent}%
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Complete Modal ── */}
      <CompleteModal
        visible={showComplete}
        progress={progress}
        onConfirm={handleSubmit}
        onCancel={() => setComplete(false)}
        submitting={submitting}
      />
    </KeyboardAvoidingView>
  );
}

const headerStyles = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: colors.border,
    paddingHorizontal: 16, paddingBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 6, zIndex: 100,
  },
  topRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  backBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backIcon:    { fontSize: 24, color: colors.subtext, lineHeight: 28 },
  title:       { fontSize: 15, fontWeight: '800', color: colors.text },
  recordNum:   { fontSize: 10, color: colors.disabled, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginTop: 2 },
  statusBadge: { backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#BFDBFE' },
  statusTxt:   { fontSize: 9, fontWeight: '800', color: colors.blue, letterSpacing: 0.5 },

  infoRow:     { flexDirection: 'row', gap: 8, marginBottom: 10 },
  infoCell:    { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 8, padding: 7, borderWidth: 1, borderColor: colors.border },
  infoLabel:   { fontSize: 8, fontWeight: '700', color: colors.disabled, letterSpacing: 0.5 },
  infoVal:     { fontSize: 11, fontWeight: '700', color: colors.text, marginTop: 2 },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  progressTrack: { flex: 1, height: 8, backgroundColor: '#F3F4F6', borderRadius: 99, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 99 },
  progressPct:   { fontSize: 13, fontWeight: '800' },
  progressDetail:{ fontSize: 11, color: colors.disabled, fontWeight: '600' },

  statRow:     { flexDirection: 'row', gap: 12, alignItems: 'center' },
  statOk:      { fontSize: 11, fontWeight: '700', color: colors.ok },
  statNg:      { fontSize: 11, fontWeight: '700', color: colors.ng },
  statPending: { fontSize: 11, fontWeight: '700', color: colors.disabled },
  savingTxt:   { fontSize: 10, color: colors.warning, fontWeight: '600', marginLeft: 'auto' as any },
});

const contentStyles = StyleSheet.create({
  container: { padding: 16 },

  csHeader:       { backgroundColor: '#1E3A5F', borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  csHeaderTitle:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  csHeaderTitleTxt:{ color: '#fff', fontWeight: '700', fontSize: 13, flex: 1 },
  csDocLabel:     { fontSize: 8, color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  csDocVal:       { fontSize: 11, color: '#fff', fontWeight: '700', textAlign: 'right' },
  csHeaderGrid:   { flexDirection: 'row', backgroundColor: '#fff' },
  csCell:         { flex: 1, padding: 8, borderRightWidth: 1, borderRightColor: colors.border },
  csCellLabel:    { fontSize: 8, fontWeight: '700', color: colors.disabled, marginBottom: 2 },
  csCellVal:      { fontSize: 11, fontWeight: '700', color: colors.text },

  legendRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  legendDot:   { width: 10, height: 10, borderRadius: 3 },
  legendTxt:   { fontSize: 10, fontWeight: '600', color: colors.subtext },

  ngSummary:      { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1.5, borderColor: '#FECACA', borderStyle: 'dashed' },
  ngSummaryTitle: { fontSize: 13, fontWeight: '700', color: colors.ng, marginBottom: 8 },
  ngRow:          { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  ngNumBadge:     { backgroundColor: '#FEE2E2', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  ngNumTxt:       { fontSize: 10, fontWeight: '700', color: colors.ng },
  ngItemName:     { fontSize: 12, color: colors.text, flex: 1 },
});

const footerStyles = StyleSheet.create({
  wrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: 16, paddingTop: 12,
    flexDirection: 'row', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
  },
  draftBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 14,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: 14, backgroundColor: '#F9FAFB',
  },
  draftIcon: { fontSize: 16 },
  draftTxt:  { fontSize: 14, fontWeight: '700', color: colors.subtext },
  submitBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    backgroundColor: colors.ok, borderRadius: 14, paddingVertical: 14,
  },
  submitBtnDisabled: { backgroundColor: colors.disabled },
  submitIcon:        { fontSize: 16 },
  submitTxt:         { fontSize: 14, fontWeight: '800', color: '#fff' },
});