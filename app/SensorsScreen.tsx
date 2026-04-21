import { Accelerometer, Gyroscope } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HapticButton } from '../components/haptic-button';
import { SensorBar } from '../components/sensor-bar';
import { SensorTab, Vector3 } from '../types';

const ZERO: Vector3 = { x: 0, y: 0, z: 0 };

function TiltBall({ x, y }: { x: number; y: number }) {
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  return (
    <View style={ballStyles.arena}>
      <View style={ballStyles.crossH} />
      <View style={ballStyles.crossV} />
      <View
        style={[
          ballStyles.ball,
          { transform: [{ translateX: clamp(x) * 72 }, { translateY: -clamp(y) * 72 }] },
        ]}
      />
    </View>
  );
}

const ballStyles = StyleSheet.create({
  arena: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#90CAF9',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  crossH: { position: 'absolute', left: 10, right: 10, height: 1, backgroundColor: '#BBDEFB' },
  crossV: { position: 'absolute', top: 10, bottom: 10, width: 1, backgroundColor: '#BBDEFB' },
  ball: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1565C0',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default function SensorsScreen() {
  const [accel, setAccel] = useState<Vector3>(ZERO);
  const [gyro, setGyro] = useState<Vector3>(ZERO);
  const [tab, setTab] = useState<SensorTab>('accel');

  useEffect(() => {
    if (Platform.OS === 'web') return;
    Accelerometer.setUpdateInterval(100);
    Gyroscope.setUpdateInterval(100);
    const a = Accelerometer.addListener(setAccel);
    const g = Gyroscope.addListener(setGyro);
    return () => { a.remove(); g.remove(); };
  }, []);

  const data = tab === 'accel' ? accel : gyro;
  const max = tab === 'accel' ? 1 : 3;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {Platform.OS === 'web' && (
        <View style={styles.webBanner}>
          <Text style={styles.webBannerText}>
            Accelerometer &amp; Gyroscope are not available on web — use the Expo Go app on a physical device.
          </Text>
        </View>
      )}
      <Text style={styles.intro}>
        {tab === 'accel'
          ? 'Accelerometer — m/s² on 3 axes. At rest, Z ≈ 1 g (gravity pulling down).'
          : 'Gyroscope — rotation rate in rad/s. Rotate or tilt the device to see values change.'}
      </Text>

      <View style={styles.tabs}>
        {(['accel', 'gyro'] as SensorTab[]).map((t) => (
          <Text
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}>
            {t === 'accel' ? 'Accelerometer' : 'Gyroscope'}
          </Text>
        ))}
      </View>

      {tab === 'accel' && <TiltBall x={accel.x} y={accel.y} />}

      <SensorBar axis="X" value={data.x} max={max} color="#EF5350" />
      <SensorBar axis="Y" value={data.y} max={max} color="#66BB6A" />
      <SensorBar axis="Z" value={data.z} max={max} color="#42A5F5" />

      <HapticButton
        label="Pulse Haptic"
        onPress={() => {}}
        hapticStyle="medium"
        style={styles.hapticBtn}
      />

      <View style={styles.codeBox}>
        <Text style={styles.code}>{tab === 'accel'
          ? `Accelerometer.setUpdateInterval(100); // ms
Accelerometer.addListener(({ x, y, z }) => {
  // x: ${accel.x.toFixed(3)}  y: ${accel.y.toFixed(3)}  z: ${accel.z.toFixed(3)}
});`
          : `Gyroscope.setUpdateInterval(100); // ms
Gyroscope.addListener(({ x, y, z }) => {
  // x: ${gyro.x.toFixed(3)}  y: ${gyro.y.toFixed(3)}  z: ${gyro.z.toFixed(3)}
});`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, paddingBottom: 40 },
  intro: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 },
  tabs: { flexDirection: 'row', backgroundColor: '#E0E0E0', borderRadius: 8, marginBottom: 4 },
  tab: { flex: 1, textAlign: 'center', paddingVertical: 9, fontSize: 14, color: '#555', borderRadius: 8 },
  tabActive: { backgroundColor: '#1565C0', color: '#fff', fontWeight: '700' },
  hapticBtn: { marginTop: 16, backgroundColor: '#6A1B9A' },
  codeBox: { backgroundColor: '#263238', borderRadius: 8, padding: 14, marginTop: 16 },
  code: { color: '#80CBC4', fontFamily: 'monospace', fontSize: 12, lineHeight: 18 },
  webBanner: { backgroundColor: '#FFF3E0', borderRadius: 8, padding: 12, marginBottom: 12 },
  webBannerText: { color: '#E65100', fontSize: 13, lineHeight: 18 },
});
