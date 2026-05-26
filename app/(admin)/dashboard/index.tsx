import QRScannerModal from '@/src/components/common/QRScannerModal';
import {
  MaintenanceRecord,
  useMaintenanceRecords,
} from '@/src/hooks/useMaintenanceRecords';
import { useAuthStore } from '@/src/store/authStore';
import { borderRadius, colors, spacing, typography } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// ── helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    in_progress: 'In Progress',
    completed: 'Completed',
    validated: 'Validated',
    rejected: 'Rejected',
  };
  return map[status] ?? status;
}

function cycleLabel(pm_cycle: string) {
  const map: Record<string, string> = {
    '1m': '1M', '3m': '3M', '6m': '6M', '1y': '1Y',
  };
  return map[pm_cycle?.toLowerCase()] ?? pm_cycle;
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    in_progress: '#F59E0B',
    completed: '#3B82F6',
    validated: '#10B981',
    rejected: '#EF4444',
  };
  return map[status] ?? '#6B7280';
}

function statusBg(status: string) {
  const map: Record<string, string> = {
    in_progress: '#FEF3C7',
    completed: '#EFF6FF',
    validated: '#D1FAE5',
    rejected: '#FEE2E2',
  };
  return map[status] ?? '#F3F4F6';
}

// ── Nav types ─────────────────────────────────────────────────────────────────
type NavTab = 'dashboard' | 'schedules' | 'history' | 'profile';
interface NavItem { key: NavTab; icon: string; label: string; route?: string; }

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', icon: '🏠', label: 'Home', route: '/' },
  { key: 'schedules', icon: '📋', label: 'Schedule', route: '/(admin)/schedules' },
  { key: 'history', icon: '🕐', label: 'History', route: '/(admin)/history' },
  { key: 'profile', icon: '👤', label: 'Profile', route: '/(admin)/profile' },
];

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon, color, bg,
}: {
  label: string; value: number; icon: string; color: string; bg: string;
}) {
  return (
    <View style={[statStyles.card, { borderLeftColor: color }]}>
      <View style={[statStyles.iconWrap, { backgroundColor: bg }]}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

// ── Maintenance Record Card ───────────────────────────────────────────────────
function RecordCard({ item, onPress }: { item: MaintenanceRecord; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.machineRow}>
            <View style={[styles.activityIcon, { backgroundColor: statusBg(item.status) }]}>
              <Text style={{ fontSize: 14 }}>🔧</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.machineName} numberOfLines={1}>
                {item.equipment_name}
              </Text>
              <Text style={styles.recordNumber}>{item.record_number}</Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: statusBg(item.status) }]}>
            <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>
              {statusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.metaText} numberOfLines={1}>
              {formatDate(item.maintenance_date)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>👷</Text>
            <Text style={styles.metaText} numberOfLines={1}>
              {item.technician_name}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📄</Text>
            <Text style={styles.metaText} numberOfLines={1}>
              {item.template_name}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🕐</Text>
            <Text style={styles.metaText}>
              {item.start_time?.slice(0, 5) ?? '-'}
              {item.end_time ? ` – ${item.end_time.slice(0, 5)}` : ''}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <Text style={styles.cardFooterText}>{cycleLabel(item.pm_cycle)} Cycle</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.cardFooterText}>{item.etm_group}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Floating Navbar ───────────────────────────────────────────────────────────
function FloatingNavbar({
  activeTab, onTabPress,
}: { activeTab: NavTab; onTabPress: (tab: NavTab, route?: string) => void }) {
  return (
    <View style={navStyles.wrapper}>
      <View style={navStyles.container}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={navStyles.navItem}
              onPress={() => onTabPress(item.key, item.route)}
              activeOpacity={0.75}
            >
              {isActive && <View style={navStyles.activePill} />}
              <View style={[navStyles.iconWrap, isActive && navStyles.iconWrapActive]}>
                <Text style={navStyles.icon}>{item.icon}</Text>
              </View>
              <Text style={[navStyles.label, isActive && navStyles.labelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Logout Modal ──────────────────────────────────────────────────────────────
function LogoutModal({
  visible, onConfirm, onCancel,
}: { visible: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.box}>
          <View style={modalStyles.iconWrap}>
            <Text style={{ fontSize: 32 }}>🚪</Text>
          </View>
          <Text style={modalStyles.title}>Sign Out</Text>
          <Text style={modalStyles.message}>
            Are you sure you want to sign out from Wuling Apps?
          </Text>
          <View style={modalStyles.actions}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={modalStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.confirmBtn} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={modalStyles.confirmText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [showLogout, setShowLogout] = useState(false);
  const [activeStatus, setActiveStatus] = useState('all');

  const router = useRouter();
  const { user, logout } = useAuthStore();

  const { data, isLoading, isError, refetch, isFetching } = useMaintenanceRecords({
    search: search || undefined,
    filter_status: activeStatus !== 'all' ? activeStatus : undefined,
    per_page: 10,
  });

  const records = data?.data?.data ?? [];
  const stats = data?.stats;

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  function handleTabPress(tab: NavTab, route?: string) {
    setActiveTab(tab);
    if (route && tab !== 'dashboard') router.push(route as any);
  }

  function handleAvatarPress() {
    Alert.alert(user?.name ?? 'Technician', 'What would you like to do?', [
      { text: 'Sign Out', style: 'destructive', onPress: () => setShowLogout(true) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function handleLogoutConfirm() {
    setShowLogout(false);
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  }

  const STATUS_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'validated', label: 'Validated' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#fff" />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerSub}>Technician Portal</Text>
              <Text style={styles.headerTitle}>Hello, {user?.name ?? 'Technician'} 👋</Text>
            </View>
            <TouchableOpacity style={styles.avatarBox} onPress={handleAvatarPress} activeOpacity={0.8}>
              <Text style={styles.avatarText}>{initials}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateCard}>
            <View style={styles.dateIconWrap}>
              <Text style={{ fontSize: 20 }}>📅</Text>
            </View>
            <View>
              <Text style={styles.dateLabel}>Today's Schedule</Text>
              <Text style={styles.dateValue}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Stat Cards ── */}
        {stats && (
          <View style={statStyles.row}>
            <StatCard label="Total" value={stats.total} icon="📊" color="#6366F1" bg="#EEF2FF" />
            <StatCard label="On Progress" value={stats.in_progress} icon="⚙️" color="#F59E0B" bg="#FEF3C7" />
            {/* <StatCard label="Completed" value={stats.completed} icon="✅" color="#3B82F6" bg="#EFF6FF" />
            <StatCard label="Validated" value={stats.validated} icon="🎯" color="#10B981" bg="#D1FAE5" /> */}
          </View>
        )}

        {/* ── Search ── */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search record or equipment..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={{ fontSize: 16, color: '#9CA3AF' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Status Filter Chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {STATUS_FILTERS.map((f) => {
            const isActive = activeStatus === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveStatus(f.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── List ── */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Maintenance Records</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/records' as any)}>
              <Text style={styles.viewAll}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 48 }} />
          ) : isError ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⚠️</Text>
              <Text style={styles.emptyText}>Gagal memuat data</Text>
              <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
                <Text style={styles.retryText}>Coba lagi</Text>
              </TouchableOpacity>
            </View>
          ) : records.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>Tidak ada record ditemukan</Text>
            </View>
          ) : (
            records.map((item) => (
              <RecordCard
                key={item.id}
                item={item}
                onPress={() => router.push(`/(admin)/records/${item.id}` as any)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <FloatingNavbar activeTab={activeTab} onTabPress={handleTabPress} />
      <LogoutModal
        visible={showLogout}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogout(false)}
      />

      {/* ── FAB QR Scanner ── */}
      <TouchableOpacity
        style={styles.fabQR}
        onPress={() => setScannerOpen(true)}
        activeOpacity={0.85}
      >
        {/* <Text style={styles.fabIcon}>⊡</Text> */}
         <Ionicons name="qr-code-outline" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={(id) => router.push(`/(admin)/records/${id}` as any)}
      />
    </View>
  );
}

// ── Stat styles ───────────────────────────────────────────────────────────────
const statStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 4,
  },
  iconWrap: {
    width: 36, height: 36,
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  value: { fontSize: 20, fontWeight: '800', color: '#111827' },
  label: { fontSize: 9, fontWeight: '600', color: '#9CA3AF', textAlign: 'center', letterSpacing: 0.3 },
});

// ── Nav styles ────────────────────────────────────────────────────────────────
const navStyles = StyleSheet.create({
  wrapper: { position: 'absolute', bottom: 24, left: 20, right: 20, alignItems: 'center' },
  container: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderRadius: 28, paddingVertical: 10, paddingHorizontal: 8,
    width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 12,
    alignItems: 'center', justifyContent: 'space-around',
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, position: 'relative' },
  activePill: { position: 'absolute', top: -10, width: 32, height: 3, borderRadius: 2, backgroundColor: colors.primary },
  iconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  iconWrapActive: { backgroundColor: '#FEF2F2' },
  icon: { fontSize: 20 },
  label: { fontSize: 10, fontWeight: '500', color: '#9CA3AF', marginTop: 2 },
  labelActive: { color: colors.primary, fontWeight: '700' },
});

// ── Modal styles ──────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  box: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 16 },
  iconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  message: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  actions: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center' },
  cancelText: { fontWeight: '600', color: '#374151', fontSize: 15 },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center' },
  confirmText: { fontWeight: '700', color: '#FFFFFF', fontSize: 15 },
});

// ── Screen styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    backgroundColor: colors.primary,
    paddingTop: 56, paddingHorizontal: spacing.lg, paddingBottom: 48,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  headerSub: { ...typography.caption, color: '#FECACA', fontWeight: '500' },
  headerTitle: { ...typography.h2, color: '#FFFFFF', marginTop: 2 },
  avatarBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: { fontWeight: '700', color: '#FFFFFF', fontSize: 15 },

  dateCard: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  dateIconWrap: { backgroundColor: colors.primary, padding: 10, borderRadius: 12 },
  dateLabel: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
  dateValue: { ...typography.bodyMd, color: '#FFFFFF', fontWeight: '700' },

  searchWrap: { marginTop: spacing.lg, marginHorizontal: spacing.lg },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 16, paddingHorizontal: spacing.md, height: 52,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4, gap: spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },

  chipRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: '#FFFFFF', borderRadius: 20,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: '#FFFFFF' },

  listSection: { paddingHorizontal: spacing.lg, paddingBottom: 24 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  listTitle: { ...typography.h3, color: '#111827' },
  viewAll: { fontSize: 11, color: colors.primary, fontWeight: '700', letterSpacing: 0.5 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: borderRadius.lg,
    marginBottom: spacing.md, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardBody: { padding: spacing.md },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  machineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, marginRight: spacing.sm },
  activityIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  machineName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  recordNumber: { fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700' },

  metaRow: { flexDirection: 'row', gap: spacing.lg, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaIcon: { fontSize: 11 },
  metaText: { fontSize: 11, color: '#6B7280', flex: 1 },

  cardFooter: {
    backgroundColor: '#FAFAFA', borderTopWidth: 1, borderTopColor: '#F3F4F6',
    paddingHorizontal: spacing.md, paddingVertical: 9,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardFooterText: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  dot: { fontSize: 11, color: '#D1D5DB' },
  chevron: { fontSize: 18, color: '#D1D5DB' },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: spacing.sm },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, color: '#6B7280' },
  retryBtn: { marginTop: spacing.sm, backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  retryText: { color: '#fff', fontWeight: '600' },
  fabQR: {
    position: 'absolute',
    bottom: 114,   // di atas FloatingNavbar (24 bottom + 70 height + gap)
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 40,
  },
  fabIcon: {
    fontSize: 26,
    color: '#FFFFFF',
  },
});