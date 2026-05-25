import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────────────────────
type EquipmentStatus = 'Operational' | 'In Maintenance' | 'Needs Inspection' | 'Critical';
type ShopFilter = 'All Shops' | 'Body Shop' | 'Assembly Shop' | 'Paint Shop';

interface Equipment {
  id: string;
  name: string;
  equNo: string;
  shop: ShopFilter;
  status: EquipmentStatus;
  healthScore: number;
  lastPM: string;
  nextPM: string;
  pmCycle: string;
  temp: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const EQUIPMENT_LIST: Equipment[] = [
  {
    id: 'PM-20260512-0001',
    name: 'Friction Roller Bed',
    equNo: 'BD-BDC-FRB-01/50',
    shop: 'Body Shop',
    status: 'In Maintenance',
    healthScore: 88,
    lastPM: '2026-05-12',
    nextPM: '2026-11-12',
    pmCycle: '6M',
    temp: '42°C',
    desc: 'Main transfer conveyor driving system in the Body welding shop.',
    icon: 'cog-outline',
  },
  {
    id: 'PM-20260512-0002',
    name: 'Lifter Main Line',
    equNo: 'AS-LIFT-MAIN-02',
    shop: 'Assembly Shop',
    status: 'Operational',
    healthScore: 94,
    lastPM: '2026-03-01',
    nextPM: '2026-06-01',
    pmCycle: '3M',
    temp: '38°C',
    desc: 'Heavy vertical lifter shifting chassis plates from assembly line.',
    icon: 'arrow-up-circle-outline',
  },
  {
    id: 'PM-20260512-0003',
    name: 'Robot Arm #04',
    equNo: 'BD-WEL-ROB-04',
    shop: 'Body Shop',
    status: 'Needs Inspection',
    healthScore: 79,
    lastPM: '2026-04-20',
    nextPM: '2026-05-25',
    pmCycle: '1M',
    temp: '51°C',
    desc: 'FANUC Welding robot suffering from slight mechanical vibration.',
    icon: 'hardware-chip-outline',
  },
  {
    id: 'PM-20260512-0004',
    name: 'Conveyor Drive',
    equNo: 'PT-CONV-DRV-01',
    shop: 'Paint Shop',
    status: 'Operational',
    healthScore: 100,
    lastPM: '2026-05-01',
    nextPM: '2026-11-01',
    pmCycle: '6M',
    temp: '34°C',
    desc: 'Main paint shop dipping process continuous loop drivetrain.',
    icon: 'git-network-outline',
  },
  {
    id: 'PM-20260512-0005',
    name: 'Spot Weld Gun #12',
    equNo: 'BD-WEL-SPT-12',
    shop: 'Body Shop',
    status: 'Critical',
    healthScore: 52,
    lastPM: '2026-02-15',
    nextPM: '2026-05-20',
    pmCycle: '3M',
    temp: '67°C',
    desc: 'High-frequency spot welding gun with overheating signs.',
    icon: 'flash-outline',
  },
  {
    id: 'PM-20260512-0006',
    name: 'Paint Spray Booth',
    equNo: 'PT-SPR-BTH-03',
    shop: 'Paint Shop',
    status: 'Operational',
    healthScore: 97,
    lastPM: '2026-04-10',
    nextPM: '2026-10-10',
    pmCycle: '6M',
    temp: '29°C',
    desc: 'Automated high-volume paint spraying enclosure.',
    icon: 'color-wand-outline',
  },
];

const SHOPS: ShopFilter[] = ['All Shops', 'Body Shop', 'Assembly Shop', 'Paint Shop'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatusColor(status: EquipmentStatus): string {
  const map: Record<EquipmentStatus, string> = {
    Operational:       '#10B981',
    'In Maintenance':  '#3B82F6',
    'Needs Inspection':'#F59E0B',
    Critical:          '#EF4444',
  };
  return map[status];
}

function getStatusBg(status: EquipmentStatus): string {
  const map: Record<EquipmentStatus, string> = {
    Operational:       '#D1FAE5',
    'In Maintenance':  '#EFF6FF',
    'Needs Inspection':'#FEF3C7',
    Critical:          '#FEE2E2',
  };
  return map[status];
}

function getHealthColor(score: number): string {
  if (score >= 90) return '#10B981';
  if (score >= 70) return '#F59E0B';
  return '#EF4444';
}

// ── Summary Strip ─────────────────────────────────────────────────────────────
function SummaryStrip({ items }: { items: Equipment[] }) {
  const operational = items.filter(e => e.status === 'Operational').length;
  const critical    = items.filter(e => e.status === 'Critical').length;
  const maintenance = items.filter(e => e.status === 'In Maintenance').length;
  const inspection  = items.filter(e => e.status === 'Needs Inspection').length;

  const cards = [
    { label: 'Operational',  value: operational, color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle-outline' as const },
    { label: 'Maintenance',  value: maintenance, color: '#3B82F6', bg: '#EFF6FF', icon: 'construct-outline' as const },
    { label: 'Inspection',   value: inspection,  color: '#F59E0B', bg: '#FEF3C7', icon: 'search-outline' as const },
    { label: 'Critical',     value: critical,    color: '#EF4444', bg: '#FEE2E2', icon: 'warning-outline' as const },
  ];

  return (
    <View style={summaryStyles.row}>
      {cards.map(card => (
        <View key={card.label} style={[summaryStyles.card, { borderLeftColor: card.color }]}>
          <View style={[summaryStyles.iconWrap, { backgroundColor: card.bg }]}>
            <Ionicons name={card.icon} size={15} color={card.color} />
          </View>
          <Text style={summaryStyles.value}>{card.value}</Text>
          <Text style={summaryStyles.label}>{card.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Equipment Card ─────────────────────────────────────────────────────────────
function EquipmentCard({ item, onPress }: { item: Equipment; onPress: () => void }) {
  const statusColor = getStatusColor(item.status);
  const statusBg    = getStatusBg(item.status);
  const healthColor = getHealthColor(item.healthScore);
  const healthWidth = `${item.healthScore}%`;

  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Top row */}
      <View style={cardStyles.top}>
        <View style={[cardStyles.iconWrap, { backgroundColor: statusBg }]}>
          <Ionicons name={item.icon} size={20} color={statusColor} />
        </View>

        <View style={cardStyles.titleBlock}>
          <Text style={cardStyles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={cardStyles.equNo}>{item.equNo}</Text>
        </View>

        <View style={[cardStyles.badge, { backgroundColor: statusBg }]}>
          <Text style={[cardStyles.badgeText, { color: statusColor }]}>{item.status}</Text>
        </View>
      </View>

      {/* Health bar */}
      <View style={cardStyles.healthRow}>
        <Text style={cardStyles.healthLabel}>Health Score</Text>
        <Text style={[cardStyles.healthValue, { color: healthColor }]}>{item.healthScore}%</Text>
      </View>
      <View style={cardStyles.barTrack}>
        <View style={[cardStyles.barFill, { width: healthWidth as any, backgroundColor: healthColor }]} />
      </View>

      {/* Meta info */}
      <View style={cardStyles.metaRow}>
        <View style={cardStyles.metaItem}>
          <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
          <Text style={cardStyles.metaText}>Last: {formatDate(item.lastPM)}</Text>
        </View>
        <View style={cardStyles.metaItem}>
          <Ionicons name="time-outline" size={11} color="#9CA3AF" />
          <Text style={cardStyles.metaText}>Next: {formatDate(item.nextPM)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={cardStyles.footer}>
        <View style={cardStyles.footerLeft}>
          <Text style={cardStyles.footerText}>{item.pmCycle} Cycle</Text>
          <Text style={cardStyles.dot}>·</Text>
          <Text style={cardStyles.footerText}>{item.shop}</Text>
          <Text style={cardStyles.dot}>·</Text>
          <Ionicons name="thermometer-outline" size={11} color="#9CA3AF" />
          <Text style={cardStyles.footerText}>{item.temp}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
      </View>
    </TouchableOpacity>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
interface EquipmentTabProps {
  onSelectEquipment?: (id: string) => void;
}

export default function EquipmentTab({ onSelectEquipment }: EquipmentTabProps) {
  const router = useRouter();
  const [selectedShop, setSelectedShop] = useState<ShopFilter>('All Shops');
  const [search, setSearch]             = useState('');
  const [refreshing, setRefreshing]     = useState(false);

  const filtered = EQUIPMENT_LIST.filter(e => {
    const matchShop   = selectedShop === 'All Shops' || e.shop === selectedShop;
    const matchSearch = search.trim() === '' ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.equNo.toLowerCase().includes(search.toLowerCase());
    return matchShop && matchSearch;
  });

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const handleSelectEquipment = (id: string) => {
    if (onSelectEquipment) {
      onSelectEquipment(id);
    } else {
      router.push(`/(admin)/records/${id}` as any);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            colors={['#D91E1E']}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerSub}>Wuling Plant Cikarang</Text>
              <View style={styles.headerTitleRow}>
                <Ionicons name="construct" size={22} color="#FFFFFF" />
                <Text style={styles.headerTitle}>Equipment</Text>
              </View>
            </View>
            <View style={styles.totalBadge}>
              <Text style={styles.totalValue}>{EQUIPMENT_LIST.length}</Text>
              <Text style={styles.totalLabel}>Total Units</Text>
            </View>
          </View>

          <Text style={styles.headerDesc}>
            Monitor status, health score, and PM schedule for all plant machinery.
          </Text>

          {/* Shop filter tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shopTabRow}
          >
            {SHOPS.map(shop => (
              <TouchableOpacity
                key={shop}
                onPress={() => setSelectedShop(shop)}
                style={[
                  styles.shopTab,
                  selectedShop === shop && styles.shopTabActive,
                ]}
                activeOpacity={0.75}
              >
                <Text style={[
                  styles.shopTabText,
                  selectedShop === shop && styles.shopTabTextActive,
                ]}>
                  {shop}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Summary Strip ── */}
        <SummaryStrip items={EQUIPMENT_LIST} />

        {/* ── Search ── */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search equipment or code..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── List Header ── */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {selectedShop === 'All Shops' ? 'All Equipment' : selectedShop}
          </Text>
          <Text style={styles.listCount}>{filtered.length} units</Text>
        </View>

        {/* ── Equipment List ── */}
        <View style={styles.listSection}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="construct-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No equipment found</Text>
            </View>
          ) : (
            filtered.map(item => (
              <EquipmentCard
                key={item.id}
                item={item}
                onPress={() => handleSelectEquipment(item.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Summary styles ────────────────────────────────────────────────────────────
const summaryStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderLeftWidth: 3,
    gap: 3,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  iconWrap: {
    width: 30, height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  value: { fontSize: 18, fontWeight: '800', color: '#111827' },
  label: { fontSize: 8, fontWeight: '700', color: '#9CA3AF', textAlign: 'center', letterSpacing: 0.4, textTransform: 'uppercase' },
});

// ── Card styles ───────────────────────────────────────────────────────────────
const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingBottom: 10,
    gap: 10,
  },
  iconWrap: {
    width: 40, height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: { flex: 1 },
  name:  { fontSize: 13, fontWeight: '700', color: '#111827' },
  equNo: { fontSize: 10, color: '#D91E1E', fontFamily: 'monospace', marginTop: 2, fontWeight: '600' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },

  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 5,
  },
  healthLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600' },
  healthValue: { fontSize: 10, fontWeight: '800', fontFamily: 'monospace' },
  barTrack: {
    height: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginHorizontal: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  barFill: { height: '100%', borderRadius: 3 },

  metaRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 16,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaText: { fontSize: 10, color: '#6B7280' },

  footer: {
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerText: { fontSize: 10, color: '#9CA3AF', fontWeight: '600' },
  dot:        { fontSize: 10, color: '#D1D5DB' },
});

// ── Screen styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    backgroundColor: '#D91E1E',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...Platform.select({
      ios:     { shadowColor: '#D91E1E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerSub:      { fontSize: 11, color: '#FECACA', fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  headerTitle:    { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  headerDesc:     { fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 18, marginBottom: 14 },

  totalBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  totalLabel: { fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  shopTabRow: { gap: 8, paddingBottom: 2 },
  shopTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  shopTabActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  shopTabText:       { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  shopTabTextActive: { color: '#D91E1E' },

  searchWrap: { marginTop: 16, marginHorizontal: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  listTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  listCount: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },

  listSection: { paddingHorizontal: 16 },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText:  { fontSize: 14, color: '#9CA3AF' },
});