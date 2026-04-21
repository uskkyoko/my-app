import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

type Props = {
  label: string;
  onPress: () => void;
  hapticStyle?: HapticStyle;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
};

export function HapticButton({ label, onPress, hapticStyle = 'medium', style, disabled }: Props) {
  async function handlePress() {
    if (hapticStyle === 'selection') {
      await Haptics.selectionAsync();
    } else if (hapticStyle === 'success') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (hapticStyle === 'warning') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else if (hapticStyle === 'error') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      const impact = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      }[hapticStyle] ?? Haptics.ImpactFeedbackStyle.Medium;
      await Haptics.impactAsync(impact);
    }
    onPress();
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        style as ViewStyle,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#1565C0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.4 },
  label: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
