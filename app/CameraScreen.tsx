import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Platform, StyleSheet, Text, View } from 'react-native';
import React, { useRef, useState } from 'react';

import { HapticButton } from '../components/haptic-button';
import { CapturedPhoto } from '../types';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Platform.select demonstrates platform detection (required capability)
  const captureLabel = Platform.select({
    ios: 'Capture  (iOS)',
    android: 'Capture  (Android)',
    default: 'Capture',
  })!;

  async function capture() {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const pic = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (pic) {
        setPhotos((prev) => [
          { uri: pic.uri, width: pic.width, height: pic.height, capturedAt: Date.now() },
          ...prev,
        ]);
      }
    } finally {
      setCapturing(false);
    }
  }

  if (!permission) {
    return <View style={styles.center}><Text style={styles.msg}>Checking camera permission…</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>Camera access is needed to show a live preview.</Text>
        <HapticButton
          label="Grant Permission"
          onPress={requestPermission}
          hapticStyle="medium"
          style={styles.permBtn}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.overlay}>
          <Text style={styles.photoCount}>
            {photos.length} photo{photos.length !== 1 ? 's' : ''} captured
          </Text>
        </View>
      </CameraView>

      <View style={styles.controls}>
        <HapticButton
          label={`Flip  (${facing === 'back' ? 'Back' : 'Front'})`}
          onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
          hapticStyle="selection"
          style={styles.flipBtn}
        />
        <HapticButton
          label={capturing ? 'Capturing…' : captureLabel}
          onPress={capture}
          hapticStyle="heavy"
          disabled={capturing}
          style={styles.captureBtn}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>Platform: {Platform.OS}</Text>
        <Text style={styles.infoText}>
          Facing: {facing} · Photos: {photos.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  msg: { fontSize: 16, color: '#333', textAlign: 'center', lineHeight: 22 },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  photoCount: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#111',
  },
  flipBtn: { flex: 1, backgroundColor: '#37474F' },
  captureBtn: { flex: 2, backgroundColor: '#C62828' },
  permBtn: { width: 200 },
  info: {
    backgroundColor: '#1A1A1A',
    padding: 12,
    gap: 2,
  },
  infoText: {
    color: '#80CBC4',
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
