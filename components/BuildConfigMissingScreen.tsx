import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { darkColors } from '../theme/colors';

/**
 * Shown in release builds when Supabase public env was not present at bundle time
 * (typical after EAS build without dashboard env vars).
 */
export function BuildConfigMissingScreen() {
  const c = darkColors;
  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: c.text.primary }]}>
          Configuration missing
        </Text>
        <Text style={[styles.body, { color: c.text.secondary }]}>
          This install was built without{' '}
          <Text style={{ color: c.text.primary }}>
            EXPO_PUBLIC_SUPABASE_URL
          </Text>{' '}
          and{' '}
          <Text style={{ color: c.text.primary }}>
            EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
          </Text>
          . Expo Go works because your Mac loads{' '}
          <Text style={{ color: c.text.primary }}>.env.local</Text>; EAS does
          not upload that file.
        </Text>
        <Text style={[styles.subtitle, { color: c.text.primary }]}>
          Fix (one rebuild)
        </Text>
        <Text style={[styles.body, { color: c.text.secondary }]}>
          1. Expo dashboard → your project → Environment variables.{'\n'}
          2. Add the variables for the{' '}
          <Text style={{ color: c.text.primary }}>preview</Text> environment
          (same values as .env.local).{'\n'}
          3. Optional:{' '}
          <Text style={{ color: c.text.primary }}>
            EXPO_PUBLIC_OCR_API_URL
          </Text>{' '}
          must be a URL your phone can reach (HTTPS recommended);{' '}
          <Text style={{ color: c.text.primary }}>127.0.0.1</Text> points at the
          phone, not your computer.{'\n'}
          4. Run{' '}
          <Text style={[styles.mono, { color: c.accent.light }]}>
            eas build --platform android --profile preview
          </Text>
          .
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 13,
  },
});
