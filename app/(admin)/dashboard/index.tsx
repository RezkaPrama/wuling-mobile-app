import { Badge } from '@/src/components/common/Badge';
import { useSchedules } from '@/src/hooks/useSchedules';
import { useAuthStore } from '@/src/store/authStore';
import { borderRadius, colors, spacing, typography } from '@/src/theme';
import { Schedule } from '@/src/types/schedule';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// ── helper ──────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
}

function progressPercent(status: string, progress?: number) {
  if (progress !== undefined) return progress;
  if (status === 'completed') return 100;
  if (status === 'in_progress') return 50;
  return 0;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    scheduled:          'Upcoming',
    in_progress:        'In Progress',
    completed:          'Completed',
    overdue:            'Overdue',
    pending_validation: 'Pending',
  };
  return map[status] ?? status;
}

function cycleLabel(pm_cycle: string) {
  const map: Record<string, string> = {
    '1m': '1M Cycle', '3m': '3M Cycle',
    '6m': '6M Cycle', '1y': '1Y Cycle',
  };
  return map[pm_cycle?.toLowerCase()] ?? pm_cycle;
}

// ── komponen kartu jadwal ────────────────────────────────────────────────────
function ScheduleCard({ item, onPress }: { item: Schedule; onPress: () => void }) {
  const pct = progressPercent(item.status, item.progress);
  const isCompleted = item.status === 'completed';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* atas kartu */}
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          {/* ikon + nama */}
          <View style={styles.machineRow}>
            <View style={[styles.activityIcon, isCompleted && styles.activityIconGreen]}>
              <Text style={{ fontSize: 14 }}>⚡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.machineName} numberOfLines={1}>
                {item.equipment_name}
              </Text>
              <Text style={styles.scheduleId}>{item.schedule_id}</Text>
            </View>
          </View>
          <Badge status={item.status} label={statusLabel(item.status)} />
        </View>

        {/* lokasi + waktu */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📍</Text>
            <Text style={styles.metaText} numberOfLines={1}>{item.location ?? '-'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🕐</Text>
            <Text style={styles.metaText}>{item.scheduled_date ? formatDate(item.scheduled_date) : '-'}</Text>
          </View>
        </View>

        {/* progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>PROGRESS</Text>
            <Text style={[styles.progressPct, pct > 0 && { color: colors.primary }]}>
              {pct}%
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
        </View>
      </View>

      {/* bawah kartu */}
      <View style={styles.cardFooter}>
        <Text style={styles.cardFooterText}>Type: {cycleLabel(item.pm_cycle)}</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── screen utama ─────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { user } = useAuthStore();

  const { data, isLoading, isError, refetch, isFetching } = useSchedules();

  const schedules: Schedule[] = data?.data ?? [];
  const filtered = schedules.filter(s =>
    s.equipment_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.schedule_id?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#fff" />
        }
      >
        {/* ── Header merah ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerSub}>Technician Portal</Text>
              <Text style={styles.headerTitle}>Hello, {user?.name ?? 'Technician'} 👋</Text>
            </View>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          {/* tanggal hari ini */}
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

        {/* ── Search bar ── */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search machine or ID..."
              placeholderTextColor={colors.text.disabled}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* ── List ── */}
        {/* <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Maintenance Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/schedules')}>
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
          ) : filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>Tidak ada jadwal ditemukan</Text>
            </View>
          ) : (
            filtered.map(item => (
              <ScheduleCard
                key={item.id}
                item={item}
                onPress={() => router.push(`/(admin)/records/${item.id}`)}
              />
            ))
          )}
        </View> */}
      </ScrollView>
    </View>
  );
}

// ── styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },

  // header
  header: {
    backgroundColor: colors.primary,
    paddingTop: 56,
    paddingHorizontal: spacing.lg,
    paddingBottom: 48,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerSub: { ...typography.caption, color: '#FECACA', fontWeight: '500' },
  headerTitle: { ...typography.h2, color: '#FFFFFF', marginTop: 2 },
  avatarBox: {
    width: 48, height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: { fontWeight: '700', color: '#FFFFFF', fontSize: 15 },

  // date card
  dateCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dateIconWrap: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 12,
  },
  dateLabel: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
  dateValue: { ...typography.bodyMd, color: '#FFFFFF', fontWeight: '700' },

  // search
  searchWrap: {
    marginTop: -22,
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    gap: spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, ...typography.body, color: colors.text.primary },
  filterBtn: {
    width: 52, height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  // list
  listSection: { paddingHorizontal: spacing.lg, marginTop: spacing.xl, paddingBottom: 24 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  listTitle: { ...typography.h3, color: colors.text.primary },
  viewAll: { ...typography.caption, color: colors.primary, fontWeight: '700', letterSpacing: 0.5 },

  // card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardBody: { padding: spacing.md },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  machineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, marginRight: spacing.sm },
  activityIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center', justifyContent: 'center',
  },
  activityIconGreen: { backgroundColor: '#D1FAE5' },
  machineName: { ...typography.body, fontWeight: '700', color: colors.text.primary },
  scheduleId: { fontSize: 10, color: colors.text.disabled, fontFamily: 'monospace', marginTop: 2 },

  metaRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaIcon: { fontSize: 12 },
  metaText: { ...typography.caption, color: colors.text.secondary, flex: 1 },

  progressSection: { gap: 6 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 10, fontWeight: '700', color: colors.text.disabled, letterSpacing: 0.5 },
  progressPct: { fontSize: 10, fontWeight: '700', color: colors.text.disabled },
  progressTrack: {
    height: 8, backgroundColor: '#F3F4F6',
    borderRadius: borderRadius.full, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },

  cardFooter: {
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterText: { ...typography.caption, color: colors.text.disabled, fontWeight: '600' },
  chevron: { fontSize: 18, color: '#D1D5DB', fontWeight: '300' },

  // empty / error
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: spacing.sm },
  emptyIcon: { fontSize: 40 },
  emptyText: { ...typography.body, color: colors.text.secondary },
  retryBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryText: { color: '#fff', fontWeight: '600' },
});