import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  axis: string;
  value: number;
  max: number;
  color: string;
};

export function SensorBar({ axis, value, max, color }: Props) {
  const pct = Math.min(Math.abs(value) / max, 1);
  return (
    <View style={styles.row}>
      <Text style={styles.axis}>{axis}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={styles.val}>{value.toFixed(3)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4, gap: 8 },
  axis: { width: 16, fontWeight: '700', fontSize: 13, color: '#333' },
  track: {
    flex: 1,
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 7,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 7 },
  val: { width: 60, textAlign: 'right', fontFamily: 'monospace', fontSize: 12, color: '#555' },
});
