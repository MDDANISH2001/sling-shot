import { useEffect, useState, useRef } from 'react';

export interface SlingshotState {
  isReady: boolean;
  isCharging: boolean;
  isPulledBack: boolean;
  force: number;
  error: string | null;
}

interface UseNativeSlingshotProps {
  onShot: (force: number) => void;
  enabled?: boolean;
}

export const useNativeSlingshot = ({ onShot, enabled = true }: UseNativeSlingshotProps) => {
  const [state, setState] = useState<SlingshotState>({
    isReady: false,
    isCharging: false,
    isPulledBack: false,
    force: 0,
    error: null,
  });

  const pullBackTimeRef = useRef<number | null>(null);
  const lastShotTimeRef = useRef<number>(0);
  const isPulledBackRef = useRef(false);
  const onShotRef = useRef(onShot);

  // Keep the ref updated
  useEffect(() => {
    onShotRef.current = onShot;
  }, [onShot]);

  useEffect(() => {
    if (!enabled) return;

    console.log('🎯 Initializing motion sensor using DeviceMotion API...');

    if (typeof DeviceMotionEvent === 'undefined') {
      console.error('❌ DeviceMotion API not supported');
      setState(prev => ({ ...prev, error: 'DeviceMotion not supported' }));
      return;
    }

    setState(prev => ({ ...prev, isReady: true, error: null }));

    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity;
      if (!accel) return;

      const x = accel.x ?? 0;
      const y = accel.y ?? 0;
      const z = accel.z ?? 0;
      const now = Date.now();

      // Log every 500ms to avoid spam
      if (now % 500 < 50) {
        console.log(`Motion - x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, z: ${z.toFixed(2)}, pulledBack: ${isPulledBackRef.current}`);
      }

      // Prevent rapid consecutive shots (cooldown: 1 second)
      if (now - lastShotTimeRef.current < 1000) return;

      // PULL BACK DETECTION: accelerometer.y < -6
      if (y < -6 && !isPulledBackRef.current) {
        console.log('🎯 PULL BACK DETECTED! y =', y);
        pullBackTimeRef.current = now;
        isPulledBackRef.current = true;
        setState(prev => ({
          ...prev,
          isPulledBack: true,
          isCharging: true,
        }));
      }

      // RELEASE DETECTION: accelerometer.y > +8 (lowered threshold from 12)
      if (y > 8 && isPulledBackRef.current && pullBackTimeRef.current) {
        const timeSincePull = now - pullBackTimeRef.current;
        console.log('🚀 RELEASE DETECTED! y =', y, 'timeSincePull =', timeSincePull, 'ms');

        // Only valid if release happens within 600ms of pull (increased from 400ms)
        if (timeSincePull < 600) {
          // Calculate force based on acceleration magnitude
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          const force = Math.min(Math.max(magnitude / 10, 1), 10); // Normalize to 1-10

          console.log('✅ SHOT FIRED! Force:', force);

          isPulledBackRef.current = false;
          setState(prev => ({
            ...prev,
            isPulledBack: false,
            isCharging: false,
            force,
          }));

          // Trigger the shot callback
          onShotRef.current(force);
          lastShotTimeRef.current = now;
        }

        // Reset pull state
        pullBackTimeRef.current = null;
      }

      // Reset if held too long (increased to 800ms from 500ms)
      if (isPulledBackRef.current && pullBackTimeRef.current) {
        const timeSincePull = now - pullBackTimeRef.current;
        if (timeSincePull > 800) {
          console.log('⏰ Pull held too long, resetting after', timeSincePull, 'ms');
          pullBackTimeRef.current = null;
          isPulledBackRef.current = false;
          setState(prev => ({
            ...prev,
            isPulledBack: false,
            isCharging: false,
          }));
        }
      }
    };

    console.log('📱 Adding DeviceMotion event listener...');
    window.addEventListener('devicemotion', handleMotion);
    console.log('✅ Motion listener added successfully!');

    // Cleanup
    return () => {
      console.log('🧹 Removing motion listener');
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [enabled]); // Only depend on enabled, not onShot

  return state;
};
