import { authApi } from '@/src/api/auth';
import { Input } from '@/src/components/common/Input';
import { useAuthStore } from '@/src/store/authStore';
import { borderRadius, colors, spacing, typography } from '@/src/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { height } = Dimensions.get('window');

// Icon sederhana pakai Text — tidak perlu install lucide
function UserIcon() {
  return <Text style={{ fontSize: 18, color: colors.text.disabled }}>👤</Text>;
}
function LockIcon() {
  return <Text style={{ fontSize: 18, color: colors.text.disabled }}>🔒</Text>;
}

export default function LoginScreen() {
  // const [employeeId, setEmployeeId] = useState('');
  // const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('ADMIN001');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!employeeId || !password) {
      Alert.alert('Error', 'ID Teknisi dan password wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.login(employeeId, password);
      setToken(data.token);
      setUser(data.user);
      router.replace('/(admin)/dashboard/index' as any);
    } catch (error: any) {
      const msg = error?.response?.data?.errors?.employee_id?.[0]
        ?? error?.response?.data?.message
        ?? 'Periksa koneksi dan coba lagi';
      Alert.alert('Login Gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* ── Banner atas merah melengkung ── */}
        <View style={styles.banner}>
          {/* Lingkaran logo */}
          {/* Ganti logoCircle View dengan Image */}
          <View style={styles.logoCircle}>
            <Image
              source={require('../../assets/images/wuling-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>MAINTENANCE PRO</Text>
          <Text style={styles.appTagline}>Industrial Intelligence System</Text>

          {/* Dekorasi lingkaran blur */}
          <View style={styles.decorTopRight} />
          <View style={styles.decorBottomLeft} />
        </View>

        {/* ── Form section ── */}
        <View style={styles.formSection}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to start your shift</Text>

          <View style={styles.form}>
            <Input
              label="Technician ID"
              placeholder="e.g. WUL-10293"
              value={employeeId}
              onChangeText={setEmployeeId}
              autoCapitalize="none"
              keyboardType="default"
              icon={<UserIcon />}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<LockIcon />}
            />

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.loginBtnText}>Sign In</Text>
              }
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            © 2026 PT Wuling Motors. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Banner ──
  banner: {
    height: height * 0.40,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFFFFF',       // putih agar logo merah kontras
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    padding: 16,                      // ← beri padding agar logo tidak terlalu mepet
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoLetter: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.primary,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  appTagline: {
    fontSize: 12,
    color: '#FECACA',
    marginTop: 4,
  },
  decorTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  decorBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },

  // ── Form ──
  formSection: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  welcomeTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  form: { gap: spacing.lg },
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  loginBtnDisabled: { opacity: 0.65 },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    ...typography.caption,
    color: colors.text.disabled,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});