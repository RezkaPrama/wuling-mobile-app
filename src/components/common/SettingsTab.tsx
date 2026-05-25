import { useAuthStore } from '@/src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ── Types ─────────────────────────────────────────────────────────────────────
type Language = 'ID' | 'EN';

// ── Stat Block ────────────────────────────────────────────────────────────────
function StatBlock({
  label,
  value,
  color = '#111827',
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={statStyles.block}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
    </View>
  );
}

// ── Setting Row ───────────────────────────────────────────────────────────────
function SettingRow({
  icon,
  iconColor,
  iconBg,
  iconBorder,
  title,
  subtitle,
  right,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  iconBorder: string;
  title: string;
  subtitle: string;
  right: React.ReactNode;
  onPress?: () => void;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 30, bounciness: 0 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={rowStyles.row}
    >
      <Animated.View style={[rowStyles.inner, { transform: [{ scale }] }]}>
        <View style={[rowStyles.iconWrap, { backgroundColor: iconBg, borderColor: iconBorder }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <View style={rowStyles.textBlock}>
          <Text style={rowStyles.title}>{title}</Text>
          <Text style={rowStyles.subtitle}>{subtitle}</Text>
        </View>
        <View style={rowStyles.rightSlot}>{right}</View>
      </Animated.View>
    </Pressable>
  );
}

// ── Console Log ───────────────────────────────────────────────────────────────
function ConsoleLog({ logs, onClear }: { logs: string[]; onClear: () => void }) {
  return (
    <View style={consoleStyles.card}>
      <View style={consoleStyles.header}>
        <View style={consoleStyles.headerLeft}>
          <Ionicons name="information-circle-outline" size={12} color="#FACC15" />
          <Text style={consoleStyles.headerText}>SYSTEM CONSOLE LOGS</Text>
        </View>
        <TouchableOpacity onPress={onClear}>
          <Ionicons name="refresh-outline" size={14} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={consoleStyles.logScroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {logs.map((log, i) => (
          <View key={i} style={consoleStyles.logRow}>
            <Text style={consoleStyles.logArrow}>&gt;</Text>
            <Text style={consoleStyles.logText}>{log}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SettingsTab() {
  const router                    = useRouter();
  const { user, logout }          = useAuthStore();
  const [offlineMode, setOffline] = useState(false);
  const [language, setLanguage]   = useState<Language>('ID');
  const [syncing, setSyncing]     = useState(false);
  const [logs, setLogs]           = useState<string[]>([
    'Shift started on 07:00 AM UTC',
    'Database initialized with 4 PM tasks',
    'Session storage caching configured successfully',
  ]);

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'RP';

  const handleSync = () => {
    if (syncing) return;
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setLogs(prev => [`Inspection cache synced at ${time} WIB`, ...prev]);
    }, 1500);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch {
      // handle error silently
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Header / Avatar ── */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name ?? 'Rezka Pratama'}</Text>
          <Text style={styles.role}>Wuling Senior Technician</Text>
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>ID: {user?.id ?? 'WUL-10293'}</Text>
          </View>
        </View>

        {/* ── Stats Strip ── */}
        <View style={styles.statsCard}>
          <StatBlock label="PM Ticked"  value="42" />
          <View style={styles.statDivider} />
          <StatBlock label="Accuracy"   value="98.5%" color="#10B981" />
          <View style={styles.statDivider} />
          <StatBlock label="Shift Hrs"  value="7.5 hr" />
        </View>

        {/* ── Device & System Config ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device & System Config</Text>
          <View style={styles.settingsGroup}>
            {/* Offline Mode */}
            <SettingRow
              icon="wifi-outline"
              iconColor="#3B82F6"
              iconBg="#EFF6FF"
              iconBorder="#BFDBFE"
              title="Cache Offline Mode"
              subtitle="Store completed sheets in memory"
              right={
                <Switch
                  value={offlineMode}
                  onValueChange={setOffline}
                  trackColor={{ false: '#E5E7EB', true: '#D91E1E' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E5E7EB"
                />
              }
            />

            <View style={styles.divider} />

            {/* Language */}
            <SettingRow
              icon="globe-outline"
              iconColor="#EA580C"
              iconBg="#FFF7ED"
              iconBorder="#FED7AA"
              title="System Language"
              subtitle="Localization target translation"
              right={
                <View style={langStyles.toggle}>
                  <TouchableOpacity
                    onPress={() => setLanguage('ID')}
                    style={[langStyles.btn, language === 'ID' && langStyles.btnActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[langStyles.btnText, language === 'ID' && langStyles.btnTextActive]}>
                      ID
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setLanguage('EN')}
                    style={[langStyles.btn, language === 'EN' && langStyles.btnActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[langStyles.btnText, language === 'EN' && langStyles.btnTextActive]}>
                      EN
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            />

            <View style={styles.divider} />

            {/* Manual Sync */}
            <SettingRow
              icon="server-outline"
              iconColor="#10B981"
              iconBg="#D1FAE5"
              iconBorder="#A7F3D0"
              title="Manual Database Sync"
              subtitle="Push inspection checklists to server"
              onPress={handleSync}
              right={
                <Text style={[syncStyles.btn, syncing && syncStyles.btnDisabled]}>
                  {syncing ? 'Syncing...' : 'Sync'}
                </Text>
              }
            />
          </View>
        </View>

        {/* ── Console Logs ── */}
        <View style={styles.section}>
          <ConsoleLog
            logs={logs}
            onClear={() => setLogs(['Local state cleared'])}
          />
        </View>

        {/* ── Logout ── */}
        <View style={[styles.section, { paddingBottom: 8 }]}>
          <TouchableOpacity style={logoutStyles.btn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={18} color="#6B7280" />
            <Text style={logoutStyles.text}>Keluar Sistem (Log Out)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Stat styles ───────────────────────────────────────────────────────────────
const statStyles = StyleSheet.create({
  block: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  label: { fontSize: 9, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 20, fontWeight: '800', marginTop: 2 },
});

// ── Row styles ────────────────────────────────────────────────────────────────
const rowStyles = StyleSheet.create({
  row:        { overflow: 'hidden' },
  inner:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  iconWrap:   { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  textBlock:  { flex: 1 },
  title:      { fontSize: 12, fontWeight: '800', color: '#111827' },
  subtitle:   { fontSize: 9, color: '#9CA3AF', marginTop: 2 },
  rightSlot:  { alignItems: 'flex-end' },
});

// ── Language toggle styles ────────────────────────────────────────────────────
const langStyles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  btn:          { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  btnActive:    { backgroundColor: '#FFFFFF', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }, android: { elevation: 1 } }) },
  btnText:      { fontSize: 10, fontWeight: '700', color: '#9CA3AF' },
  btnTextActive:{ color: '#D91E1E' },
});

// ── Sync button styles ────────────────────────────────────────────────────────
const syncStyles = StyleSheet.create({
  btn:        { fontSize: 12, fontWeight: '700', color: '#D91E1E' },
  btnDisabled:{ color: '#9CA3AF' },
});

// ── Console styles ────────────────────────────────────────────────────────────
const consoleStyles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 14,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 8,
    marginBottom: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerText: { fontSize: 8, fontWeight: '700', color: '#FACC15', letterSpacing: 1, textTransform: 'uppercase' },
  logScroll:  { maxHeight: 88 },
  logRow:     { flexDirection: 'row', gap: 6, marginBottom: 6 },
  logArrow:   { fontSize: 9, color: '#6B7280', fontFamily: 'monospace', fontWeight: '700' },
  logText:    { fontSize: 9, color: '#4ADE80', fontFamily: 'monospace', flex: 1, flexWrap: 'wrap' },
});

// ── Logout styles ─────────────────────────────────────────────────────────────
const logoutStyles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  text: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
});

// ── Screen styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    backgroundColor: '#D91E1E',
    paddingTop: 56,
    paddingBottom: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...Platform.select({
      ios:     { shadowColor: '#D91E1E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },
  name:       { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  role:       { fontSize: 10, color: '#FECACA', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 },
  idBadge: {
    marginTop: 8,
    backgroundColor: '#FACC15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  idBadgeText: { fontSize: 10, fontWeight: '800', color: '#111827', letterSpacing: 0.5 },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  statDivider: { width: 1, backgroundColor: '#F3F4F6', alignSelf: 'stretch' },

  section:      { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 10 },

  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16 },
});