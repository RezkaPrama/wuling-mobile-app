import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const GRID_SIZE = width - 48; // square grid

// ── Types ─────────────────────────────────────────────────────────────────────
type PMStatus = 'In Progress' | 'Pending' | 'Upcoming' | 'Completed';
type Shop = 'All Shops' | 'Body Shop' | 'Assembly Shop' | 'Paint Shop';

interface Machine {
  id: string;
  name: string;
  shop: Shop;
  gridPos: { r: number; c: number };
  status: PMStatus;
  equNo: string;
  temp: string;
  health: number;
  desc: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const SHOPS: Shop[] = ['All Shops', 'Body Shop', 'Assembly Shop', 'Paint Shop'];

const FACTORY_MACHINES: Machine[] = [
  {
    id: 'PM-20260512-0001',
    name: 'Friction Roller Bed',
    shop: 'Body Shop',
    gridPos: { r: 1, c: 2 },
    status: 'In Progress',
    equNo: 'BD-BDC-FRB-01/50',
    temp: '42°C',
    health: 88,
    desc: 'Main transfer conveyor driving system in the Body welding shop.',
  },
  {
    id: 'PM-20260512-0002',
    name: 'Lifter Main Line',
    shop: 'Assembly Shop',
    gridPos: { r: 2, c: 1 },
    status: 'Pending',
    equNo: 'AS-LIFT-MAIN-02',
    temp: '38°C',
    health: 94,
    desc: 'Heavy vertical lifter shifting chassis plates from assembly line.',
  },
  {
    id: 'PM-20260512-0003',
    name: 'Robot Arm #04',
    shop: 'Body Shop',
    gridPos: { r: 2, c: 3 },
    status: 'Upcoming',
    equNo: 'BD-WEL-ROB-04',
    temp: '51°C',
    health: 79,
    desc: 'FANUC Welding robot suffering from slight mechanical vibration.',
  },
  {
    id: 'PM-20260512-0004',
    name: 'Conveyor Drive',
    shop: 'Paint Shop',
    gridPos: { r: 3, c: 2 },
    status: 'Completed',
    equNo: 'PT-CONV-DRV-01',
    temp: '34°C',
    health: 100,
    desc: 'Main paint shop dipping process continuous loop drivetrain.',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getLedColor(status: PMStatus) {
  const map: Record<PMStatus, string> = {
    'Completed':   '#4ADE80',
    'In Progress': '#60A5FA',
    'Upcoming':    '#FACC15',
    'Pending':     '#F87171',
  };
  return map[status];
}

function getBadgeColor(status: PMStatus): { bg: string; text: string } {
  const map: Record<PMStatus, { bg: string; text: string }> = {
    'In Progress': { bg: '#EFF6FF', text: '#3B82F6' },
    'Completed':   { bg: '#D1FAE5', text: '#10B981' },
    'Upcoming':    { bg: '#F3F4F6', text: '#6B7280' },
    'Pending':     { bg: '#FEF3C7', text: '#D97706' },
  };
  return map[status];
}

// ── Map Node ──────────────────────────────────────────────────────────────────
function MapNode({
  machine,
  isSelected,
  isFilteredOut,
  onPress,
  cellSize,
}: {
  machine: Machine;
  isSelected: boolean;
  isFilteredOut: boolean;
  onPress: () => void;
  cellSize: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const ledColor = getLedColor(machine.status);

  useEffect(() => {
    if (machine.status === 'Upcoming') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.5, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }
    if (machine.status === 'Pending') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.8, duration: 500, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isSelected ? 1.06 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  }, [isSelected]);

  return (
    <Pressable
      onPress={onPress}
      disabled={isFilteredOut}
      style={[
        mapStyles.nodeWrapper,
        {
          width: cellSize - 8,
          height: cellSize - 8,
          opacity: isFilteredOut ? 0.2 : 1,
          gridRowStart: machine.gridPos.r,
          gridColumnStart: machine.gridPos.c,
        } as any,
      ]}
    >
      <Animated.View
        style={[
          mapStyles.node,
          isSelected ? mapStyles.nodeSelected : mapStyles.nodeDefault,
          { transform: [{ scale }] },
        ]}
      >
        {/* LED dot */}
        <View style={mapStyles.ledContainer}>
          <Animated.View
            style={[
              mapStyles.ledPulse,
              { backgroundColor: ledColor, transform: [{ scale: pulse }], opacity: 0.3 },
            ]}
          />
          <View style={[mapStyles.led, { backgroundColor: ledColor }]} />
        </View>

        <Text style={mapStyles.nodeName} numberOfLines={1}>
          {machine.name.split(' ')[0]}
        </Text>
        <Text style={mapStyles.nodeShop}>
          {machine.shop.split(' ')[0]}
        </Text>

        {/* Selected pin */}
        {isSelected && (
          <View style={mapStyles.pin}>
            <Ionicons name="location" size={10} color="#FFFFFF" />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function DetailPanel({
  machine,
  onStartWork,
}: {
  machine: Machine;
  onStartWork: (id: string) => void;
}) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideAnim.setValue(20);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 6 }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [machine.id]);

  const badge = getBadgeColor(machine.status);
  const healthColor = machine.health >= 90 ? '#10B981' : machine.health >= 70 ? '#F59E0B' : '#EF4444';

  return (
    <Animated.View
      style={[
        detailStyles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Accent corner */}
      <View style={detailStyles.accentCorner} />

      {/* Top row */}
      <View style={detailStyles.topRow}>
        <View style={detailStyles.titleBlock}>
          <View style={detailStyles.nameRow}>
            <Text style={detailStyles.name}>{machine.name}</Text>
            <View style={[detailStyles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[detailStyles.badgeText, { color: badge.text }]}>{machine.status}</Text>
            </View>
          </View>
          <Text style={detailStyles.equNo}>{machine.equNo}</Text>
        </View>
        <View style={detailStyles.healthBlock}>
          <Text style={detailStyles.healthLabel}>Health Score</Text>
          <Text style={[detailStyles.healthValue, { color: healthColor }]}>{machine.health}%</Text>
        </View>
      </View>

      {/* Description */}
      <View style={detailStyles.descBox}>
        <Text style={detailStyles.desc}>{machine.desc}</Text>
      </View>

      {/* Meta grid */}
      <View style={detailStyles.metaGrid}>
        <View style={detailStyles.metaCell}>
          <Text style={detailStyles.metaCellLabel}>SHOP SECTOR</Text>
          <Text style={detailStyles.metaCellValue}>{machine.shop}</Text>
        </View>
        <View style={detailStyles.metaCell}>
          <Text style={detailStyles.metaCellLabel}>INTERNAL TEMP</Text>
          <Text style={detailStyles.metaCellValue}>{machine.temp}</Text>
        </View>
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={detailStyles.ctaBtn}
        onPress={() => onStartWork(machine.id)}
        activeOpacity={0.85}
      >
        <Text style={detailStyles.ctaText}>
          {machine.status === 'Completed' ? 'Inspeksi Ulang / Lihat PM' : 'Mulai Inspeksi Checklist'}
        </Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
interface MapTabProps {
  onSelectWork?: (id: string) => void;
}

export default function MapTab({ onSelectWork }: MapTabProps) {
  const router = useRouter();
  const [selectedShop, setSelectedShop] = useState<Shop>('All Shops');
  const [activeMachine, setActiveMachine] = useState<Machine>(FACTORY_MACHINES[0]);

  const cellSize = GRID_SIZE / 3;

  const handleSelectShop = (shop: Shop) => {
    setSelectedShop(shop);
    const filtered = shop === 'All Shops'
      ? FACTORY_MACHINES
      : FACTORY_MACHINES.filter(m => m.shop === shop);
    if (filtered.length > 0) setActiveMachine(filtered[0]);
  };

  const handleStartWork = (id: string) => {
    if (onSelectWork) {
      onSelectWork(id);
    } else {
      router.push(`/(admin)/records/${id}` as any);
    }
  };

  // Build 3x3 grid cells
  const gridCells: (Machine | null)[][] = Array.from({ length: 3 }, (_, r) =>
    Array.from({ length: 3 }, (_, c) =>
      FACTORY_MACHINES.find(m => m.gridPos.r === r + 1 && m.gridPos.c === c + 1) ?? null
    )
  );

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Spatial Floor Layout</Text>
            <View style={styles.headerTitleRow}>
              <Ionicons name="map" size={22} color="#FFFFFF" />
              <Text style={styles.headerTitle}>Machine Locator</Text>
            </View>
          </View>
          <Text style={styles.headerDesc}>
            Interactive map of plant floor. Tap a machine node to start preventive inspections instantly.
          </Text>

          {/* Shop tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shopTabRow}
          >
            {SHOPS.map(shop => (
              <TouchableOpacity
                key={shop}
                onPress={() => handleSelectShop(shop)}
                style={[styles.shopTab, selectedShop === shop && styles.shopTabActive]}
                activeOpacity={0.75}
              >
                <Text style={[styles.shopTabText, selectedShop === shop && styles.shopTabTextActive]}>
                  {shop}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Map Section ── */}
        <View style={styles.mapSection}>
          <View style={styles.mapLabelRow}>
            <View style={styles.mapLabelLeft}>
              <Ionicons name="layers-outline" size={12} color="#9CA3AF" />
              <Text style={styles.mapLabelText}>GROUND FLOOR GRID</Text>
            </View>
            <Text style={styles.mapPlantLabel}>Wuling Plant Cikarang</Text>
          </View>

          {/* Grid */}
          <View style={[styles.gridContainer, { width: GRID_SIZE, height: GRID_SIZE }]}>
            {/* Grid line overlay */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {[1, 2].map(i => (
                <View
                  key={`h${i}`}
                  style={[styles.gridLineH, { top: (GRID_SIZE / 3) * i }]}
                />
              ))}
              {[1, 2].map(i => (
                <View
                  key={`v${i}`}
                  style={[styles.gridLineV, { left: (GRID_SIZE / 3) * i }]}
                />
              ))}
            </View>

            {/* Machine nodes */}
            {gridCells.map((row, rIdx) =>
              row.map((machine, cIdx) => {
                if (!machine) {
                  return (
                    <View
                      key={`empty-${rIdx}-${cIdx}`}
                      style={[
                        mapStyles.emptyCell,
                        {
                          width: cellSize - 8,
                          height: cellSize - 8,
                          position: 'absolute',
                          top: rIdx * cellSize + 4,
                          left: cIdx * cellSize + 4,
                        },
                      ]}
                    />
                  );
                }
                const isFilteredOut = selectedShop !== 'All Shops' && machine.shop !== selectedShop;
                return (
                  <View
                    key={machine.id}
                    style={{
                      position: 'absolute',
                      top: rIdx * cellSize + 4,
                      left: cIdx * cellSize + 4,
                    }}
                  >
                    <MapNode
                      machine={machine}
                      isSelected={activeMachine?.id === machine.id}
                      isFilteredOut={isFilteredOut}
                      onPress={() => setActiveMachine(machine)}
                      cellSize={cellSize}
                    />
                  </View>
                );
              })
            )}

            {/* Scale label */}
            <View style={styles.scaleLabel} pointerEvents="none">
              <Text style={styles.scaleLabelText}>GRID SCALE: 1 UNIT = 15m</Text>
            </View>
          </View>
        </View>

        {/* ── Detail Panel ── */}
        {activeMachine && (
          <View style={styles.detailSection}>
            <DetailPanel machine={activeMachine} onStartWork={handleStartWork} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Map node styles ───────────────────────────────────────────────────────────
const mapStyles = StyleSheet.create({
  nodeWrapper: { alignItems: 'center', justifyContent: 'center' },
  node: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 3,
    position: 'relative',
  },
  nodeDefault: {
    backgroundColor: 'rgba(31,41,55,0.9)',
    borderColor: '#374151',
  },
  nodeSelected: {
    backgroundColor: 'rgba(127,29,29,0.85)',
    borderColor: '#D91E1E',
  },
  ledContainer: { alignItems: 'center', justifyContent: 'center', width: 20, height: 20 },
  ledPulse: { position: 'absolute', width: 14, height: 14, borderRadius: 7 },
  led:       { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#111827' },
  nodeName: { fontSize: 8, fontWeight: '700', color: '#D1D5DB', fontFamily: 'monospace', textAlign: 'center' },
  nodeShop: { fontSize: 6, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'monospace' },
  pin: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#D91E1E',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCell: { borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.02)' },
});

// ── Detail styles ─────────────────────────────────────────────────────────────
const detailStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#D91E1E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  accentCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 48,
    height: 48,
    backgroundColor: 'rgba(217,30,30,0.04)',
    borderBottomLeftRadius: 40,
  },
  topRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  titleBlock: { flex: 1, marginRight: 12 },
  nameRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name:       { fontSize: 15, fontWeight: '800', color: '#111827' },
  badge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText:  { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  equNo:      { fontSize: 10, color: '#D91E1E', fontFamily: 'monospace', fontWeight: '700', marginTop: 3 },

  healthBlock: { alignItems: 'flex-end' },
  healthLabel: { fontSize: 9, color: '#9CA3AF', fontWeight: '600' },
  healthValue: { fontSize: 18, fontWeight: '800', fontFamily: 'monospace' },

  descBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  desc: { fontSize: 11, color: '#6B7280', lineHeight: 16 },

  metaGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  metaCell: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 10,
    padding: 8,
  },
  metaCellLabel: { fontSize: 8, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaCellValue: { fontSize: 11, fontWeight: '700', color: '#374151', marginTop: 2 },

  ctaBtn: {
    backgroundColor: '#D91E1E',
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios:     { shadowColor: '#D91E1E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  ctaText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
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
  headerSub:      { fontSize: 10, color: '#FECACA', fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3, marginBottom: 8 },
  headerTitle:    { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerDesc:     { fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 18, marginBottom: 14 },

  shopTabRow: { gap: 8, paddingBottom: 2 },
  shopTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  shopTabActive:     { backgroundColor: '#FFFFFF' },
  shopTabText:       { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  shopTabTextActive: { color: '#D91E1E' },

  mapSection:   { paddingHorizontal: 16, marginTop: 20 },
  mapLabelRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  mapLabelLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mapLabelText: { fontSize: 9, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase' },
  mapPlantLabel:{ fontSize: 9, fontWeight: '700', color: '#6B7280', backgroundColor: '#E5E7EB', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },

  gridContainer: {
    backgroundColor: '#111827',
    borderWidth: 3,
    borderColor: '#1F2937',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },

  scaleLabel: { position: 'absolute', bottom: 6, right: 8 },
  scaleLabelText: { fontSize: 6, fontWeight: '700', color: '#4B5563', fontFamily: 'monospace' },

  detailSection: { paddingHorizontal: 16, marginTop: 16 },
});