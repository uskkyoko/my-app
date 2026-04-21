import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { HapticButton } from '../components/haptic-button';
import { LocationFix } from '../types';

type State =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'denied' }
  | { status: 'ready'; fix: LocationFix }
  | { status: 'watching'; fix: LocationFix; updates: number };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  label: { fontSize: 14, color: '#555', fontWeight: '600' },
  value: { fontSize: 14, color: '#1565C0', fontFamily: 'monospace' },
});

export default function LocationScreen() {
  const [state, setState] = useState<State>({ status: 'idle' });
  const subRef = useRef<Location.LocationSubscription | null>(null);

  async function getOnce() {
    setState({ status: 'requesting' });
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { setState({ status: 'denied' }); return; }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setState({ status: 'ready', fix: toFix(loc) });
  }

  async function startWatch() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { setState({ status: 'denied' }); return; }
    let count = 0;
    subRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 0 },
      (loc) => {
        count += 1;
        setState({ status: 'watching', fix: toFix(loc), updates: count });
      }
    );
  }

  function stopWatch() {
    subRef.current?.remove();
    subRef.current = null;
    setState((prev) => {
      if (prev.status === 'watching') return { status: 'ready', fix: prev.fix };
      return prev;
    });
  }

  useEffect(() => () => { subRef.current?.remove(); }, []);

  const fix = (state.status === 'ready' || state.status === 'watching') ? state.fix : null;
  const isWatching = state.status === 'watching';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        expo-location wraps platform GPS. Foreground permission is required.
        "Get Once" fires a single fix; "Watch Live" streams updates every second.
      </Text>

      <View style={styles.btnRow}>
        <HapticButton
          label={state.status === 'requesting' ? 'Getting…' : 'Get Once'}
          onPress={getOnce}
          hapticStyle="medium"
          disabled={state.status === 'requesting' || isWatching}
          style={styles.btn}
        />
        {!isWatching ? (
          <HapticButton
            label="Watch Live"
            onPress={startWatch}
            hapticStyle="success"
            style={[styles.btn, styles.btnGreen]}
          />
        ) : (
          <HapticButton
            label={`Stop (${(state as Extract<State, { status: 'watching' }>).updates})`}
            onPress={stopWatch}
            hapticStyle="warning"
            style={[styles.btn, styles.btnRed]}
          />
        )}
      </View>

      {state.status === 'denied' && (
        <Text style={styles.error}>Permission denied — enable Location in device Settings.</Text>
      )}

      {fix && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isWatching ? '● Live feed' : 'Last fix'} —{' '}
            {new Date(fix.timestamp).toLocaleTimeString()}
          </Text>
          <Row label="Latitude" value={`${fix.latitude.toFixed(6)} °`} />
          <Row label="Longitude" value={`${fix.longitude.toFixed(6)} °`} />
          <Row label="Accuracy" value={fix.accuracy != null ? `±${fix.accuracy.toFixed(1)} m` : 'n/a'} />
          <Row label="Altitude" value={fix.altitude != null ? `${fix.altitude.toFixed(1)} m` : 'n/a'} />
          <Row label="Speed" value={fix.speed != null ? `${fix.speed.toFixed(2)} m/s` : 'n/a'} />
          <Row label="Heading" value={fix.heading != null ? `${fix.heading.toFixed(1)} °` : 'n/a'} />
        </View>
      )}

      <View style={styles.codeBox}>
        <Text style={styles.code}>{`// One-time
const loc = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.High,
});

// Live stream
const sub = await Location.watchPositionAsync(
  { timeInterval: 1000, distanceInterval: 0 },
  (loc) => console.log(loc.coords),
);
sub.remove(); // cleanup`}</Text>
      </View>
    </ScrollView>
  );
}

function toFix(loc: Location.LocationObject): LocationFix {
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
    accuracy: loc.coords.accuracy,
    altitude: loc.coords.altitude,
    speed: loc.coords.speed,
    heading: loc.coords.heading,
    timestamp: loc.timestamp,
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, paddingBottom: 40 },
  intro: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 16 },
  btnRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  btn: { flex: 1 },
  btnGreen: { backgroundColor: '#2E7D32' },
  btnRed: { backgroundColor: '#C62828' },
  error: { color: '#C62828', marginBottom: 12, fontSize: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#777', marginBottom: 8 },
  codeBox: { backgroundColor: '#263238', borderRadius: 8, padding: 14 },
  code: { color: '#80CBC4', fontFamily: 'monospace', fontSize: 12, lineHeight: 18 },
});
