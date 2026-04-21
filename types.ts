export type CapturedPhoto = {
  uri: string;
  width: number;
  height: number;
  capturedAt: number;
};

export type LocationFix = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
};

export type SensorTab = 'accel' | 'gyro';

export type Vector3 = {
  x: number;
  y: number;
  z: number;
};
