// app/(admin)/records/index.tsx
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  MaintenanceRecord,
  useMaintenanceRecords,
} from '@/src/hooks/useMaintenanceRecords';
import { borderRadius, colors, spacing, typography } from '@/src/theme';

const { width } = Dimensions.get('window');

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function cycleLabel(pm_cycle: string) {
  const map: Record<string, string> = {
    '1m': '1 Bulan', '3m': '3 Bulan',
    '6m': '6 Bulan', '1y': '1 Tahun', '2y': '2 Tahun',
  };
  return map[pm_cycle?.toLowerCase()] ?? pm_cycle;
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string; icon: string }
> = {
  in_progress: { label: 'Dikerjakan', bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', icon: '🔧' },
  completed:   { label: 'Selesai',    bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', icon: '✅' },
  validated:   { label: 'Tervalidasi',bg: '#D1FAE5', text: '#065F46', dot: '#10B981', icon: '✔️' },
  rejected:    { label: 'Ditolak',    bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', icon: '❌' },
};

function getStatusCfg(status: string) {
  return STATUS_CONFIG[status] ?? { label: status, bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF', icon: '❓' };
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { key: 'all',         label: 'Semua'  },
  { key: 'in_progress', label: 'Proses' },
  { key: 'completed',   label: 'Selesai'},
  { key: 'validated',   label: 'Valid'  },
  { key: 'rejected',    label: 'Tolak'  },
];

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
  onPress,
  active,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  onPress?: () => void;
  active?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[s.statCard, active && { borderColor: color, borderWidth: 2 }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[s.statIconWrap, { backgroundColor: color + '1A' }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Record Card ──────────────────────────────────────────────────────────────

function RecordCard({ item, onPress }: { item: MaintenanceRecord; onPress: () => void }) {
  const cfg = getStatusCfg(item.status);

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.88}>
      {/* Status strip kiri */}
      <View style={[s.cardStrip, { backgroundColor: cfg.dot }]} />

      <View style={s.cardInner}>
        {/* Row atas: nama + badge */}
        <View style={s.cardTop}>
          <View style={s.cardIconWrap}>
            <Text style={{ fontSize: 16 }}>{cfg.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.cardName} numberOfLines={1}>
              {item.equipment_name}
            </Text>
            <Text style={s.cardCode}>{item.equipment_code}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: cfg.bg }]}>
            <View style={[s.badgeDot, { backgroundColor: cfg.dot }]} />
            <Text style={[s.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Info grid */}
        <View style={s.infoGrid}>
          <InfoChip icon="📋" label="No. Record" value={item.record_number} />
          <InfoChip icon="🔄" label="Siklus PM" value={cycleLabel(item.pm_cycle)} />
          <InfoChip icon="📅" label="Tanggal" value={formatDate(item.maintenance_date)} />
          <InfoChip icon="👤" label="Teknisi" value={item.technician_name} />
        </View>

        {/* Footer: template name + panah */}
        <View style={s.cardFooter}>
          <Text style={s.cardFooterText} numberOfLines={1}>
            📄 {item.template_name ?? '-'}
          </Text>
          <Text style={s.chevron}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function InfoChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.infoChip}>
      <Text style={s.infoIcon}>{icon}</Text>
      <View>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onRetry, isError }: { onRetry: () => void; isError?: boolean }) {
  return (
    <View style={s.empty}>
      <Text style={{ fontSize: 48 }}>{isError ? '⚠️' : '📋'}</Text>
      <Text style={s.emptyTitle}>
        {isError ? 'Gagal memuat data' : 'Tidak ada record'}
      </Text>
      <Text style={s.emptyDesc}>
        {isError
          ? 'Periksa koneksi internet Anda'
          : 'Belum ada maintenance record yang sesuai filter'}
      </Text>
      {isError && (
        <TouchableOpacity style={s.retryBtn} onPress={onRetry}>
          <Text style={s.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MaintenanceRecordsScreen() {
  const router = useRouter();
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage]                 = useState(1);

  // Debounce search: hanya query setelah user berhenti ketik
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimeout = useState<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(text: string) {
    setSearch(text);
    if (searchTimeout[0]) clearTimeout(searchTimeout[0]);
    searchTimeout[1](
      setTimeout(() => {
        setDebouncedSearch(text);
        setPage(1);
      }, 400),
    );
  }

  const params = {
    search: debouncedSearch || undefined,
    filter_status: filterStatus !== 'all' ? filterStatus : undefined,
    per_page: 20,
    page,
  };

  const { data, isLoading, isError, refetch, isFetching } = useMaintenanceRecords(params);

  const records: MaintenanceRecord[] = data?.data?.data ?? [];
  const stats = data?.stats;
  const meta  = data?.data;

  const hasNextPage = meta ? meta.current_page < meta.last_page : false;

  // ─── stat card presses → set filter ────────────────────────────────────────
  function handleStatPress(status: string) {
    setFilterStatus((prev) => (prev === status ? 'all' : status));
    setPage(1);
  }

  // ─── load more ──────────────────────────────────────────────────────────────
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetching) {
      setPage((p) => p + 1);
    }
  }, [hasNextPage, isFetching]);

  // ─── render ─────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      {/* ── Header merah ── */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={{ fontSize: 20, color: '#fff' }}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={s.headerSub}>Maintenance Management</Text>
            <Text style={s.headerTitle}>Daftar Record PM</Text>
          </View>
          {/* Placeholder agar layout simetris */}
          <View style={{ width: 40 }} />
        </View>

        {/* ── Stat Cards ── */}
        {stats && (
          <View style={s.statsRow}>
            <StatCard
              icon="📊" label="Total" value={stats.total}
              color="#6366F1"
              onPress={() => handleStatPress('all')}
              active={filterStatus === 'all'}
            />
            <StatCard
              icon="🔧" label="Proses" value={stats.in_progress}
              color="#F59E0B"
              onPress={() => handleStatPress('in_progress')}
              active={filterStatus === 'in_progress'}
            />
            <StatCard
              icon="✅" label="Selesai" value={stats.completed}
              color="#3B82F6"
              onPress={() => handleStatPress('completed')}
              active={filterStatus === 'completed'}
            />
            <StatCard
              icon="✔️" label="Valid" value={stats.validated}
              color="#10B981"
              onPress={() => handleStatPress('validated')}
              active={filterStatus === 'validated'}
            />
          </View>
        )}
      </View>

      {/* ── Search + Filter tabs ── */}
      <View style={s.controlsWrap}>
        {/* Search bar */}
        <View style={s.searchBox}>
          <Text style={{ fontSize: 15 }}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Cari nama equipment, kode, atau nomor record..."
            placeholderTextColor={colors.text.disabled}
            value={search}
            onChangeText={handleSearchChange}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setDebouncedSearch(''); }}>
              <Text style={{ fontSize: 15, color: colors.text.disabled }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter tabs */}
        <FlatList
          data={FILTER_TABS}
          keyExtractor={(t) => t.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterList}
          renderItem={({ item: tab }) => {
            const active = filterStatus === tab.key;
            return (
              <TouchableOpacity
                style={[s.filterTab, active && s.filterTabActive]}
                onPress={() => { setFilterStatus(tab.key); setPage(1); }}
                activeOpacity={0.8}
              >
                <Text style={[s.filterTabText, active && s.filterTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ── Jumlah hasil ── */}
      {!isLoading && meta && (
        <View style={s.resultBar}>
          <Text style={s.resultText}>
            {meta.total} record ditemukan
            {filterStatus !== 'all' ? ` · filter: ${FILTER_TABS.find(t => t.key === filterStatus)?.label}` : ''}
          </Text>
          {isFetching && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Memuat data...</Text>
        </View>
      ) : isError ? (
        <EmptyState isError onRetry={refetch} />
      ) : records.length === 0 ? (
        <EmptyState onRetry={refetch} />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && page === 1}
              onRefresh={() => { setPage(1); refetch(); }}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetching && page > 1 ? (
              <ActivityIndicator
                color={colors.primary}
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <RecordCard
              item={item}
              onPress={() => router.push(`/(admin)/records/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: 52,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSub: { ...typography.caption, color: '#FECACA', textAlign: 'center' },
  headerTitle: { ...typography.h3, color: '#fff', textAlign: 'center', marginTop: 2 },

  // Stat cards row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statIconWrap: {
    width: 36, height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800', lineHeight: 24 },
  statLabel: { fontSize: 9, color: '#6B7280', fontWeight: '600', textAlign: 'center' },

  // Controls
  controlsWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    fontSize: 13,
  },
  filterList: { paddingVertical: 4, gap: 8 },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: '#FEF2F2',
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: colors.primary,
  },

  // Result bar
  resultBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
  },
  resultText: { fontSize: 12, color: colors.text.secondary },

  // List
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: 100 },

  // Record card
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardStrip: { width: 4 },
  cardInner: { flex: 1, padding: spacing.md },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardIconWrap: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  cardCode: {
    fontSize: 10,
    color: colors.text.disabled,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '700' },

  // Info grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.sm,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: (width - spacing.lg * 2 - spacing.md * 2 - 4 - 8) / 2,
  },
  infoIcon: { fontSize: 12 },
  infoLabel: { fontSize: 9, color: colors.text.disabled, fontWeight: '600' },
  infoValue: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
    maxWidth: '100%',
  },

  // Card footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    marginTop: 4,
  },
  cardFooterText: {
    fontSize: 11,
    color: colors.text.disabled,
    flex: 1,
  },
  chevron: { fontSize: 20, color: '#D1D5DB' },

  // States
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { ...typography.body, color: colors.text.secondary },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: spacing.xl,
  },
  emptyTitle: { ...typography.h3, color: colors.text.primary, textAlign: 'center' },
  emptyDesc: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryText: { color: '#fff', fontWeight: '700' },
});