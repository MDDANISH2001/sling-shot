import { useEffect, useState, useRef } from "react";

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

export const useNativeSlingshot = ({
  onShot,
  enabled = true,
}: UseNativeSlingshotProps) => {
  const [state, setState] = useState<SlingshotState>({
    isReady: false,
    isCharging: false,
    isPulledBack: false,
    force: 0,
    error: null,
  });

  const lastShotTimeRef = useRef<number>(0);
  const lastAngleRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);
  const onShotRef = useRef(onShot);

  // Keep the ref updated
  useEffect(() => {
    onShotRef.current = onShot;
  }, [onShot]);

  useEffect(() => {
    if (!enabled) return;

    console.log("🎯 Initializing motion sensor using DeviceMotion API...");

    if (typeof DeviceMotionEvent === "undefined") {
      console.error("❌ DeviceMotion API not supported");
      setState((prev) => ({ ...prev, error: "DeviceMotion not supported" }));
      return;
    }

    setState((prev) => ({ ...prev, isReady: true, error: null }));

    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity;
      if (!accel) return;

      const x = accel.x ?? 0;
      const y = accel.y ?? 0;
      const z = accel.z ?? 0;
      const now = Date.now();

      // Calculate angle from vertical (tilt angle in degrees)
      const angle = Math.atan2(y, z) * (180 / Math.PI);
      const angleDelta = angle - lastAngleRef.current;

      // Calculate time delta
      const timeDelta =
        lastUpdateTimeRef.current > 0 ? now - lastUpdateTimeRef.current : 0;

      // Calculate angular velocity (degrees per second)
      const angularVelocity =
        timeDelta > 0 ? Math.abs(angleDelta) / (timeDelta / 1000) : 0;

      // Calculate total acceleration magnitude
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      // Log every 500ms to avoid spam
      if (now % 500 < 50) {
        console.log(
          `Angle: ${angle.toFixed(1)}°, Velocity: ${angularVelocity.toFixed(
            0
          )}°/s, Accel: ${magnitude.toFixed(1)}`
        );
      }

      // Prevent rapid consecutive shots (cooldown: 1 second)
      if (now - lastShotTimeRef.current < 1000) {
        lastAngleRef.current = angle;
        lastUpdateTimeRef.current = now;
        return;
      }

      // SLINGSHOT DETECTION: Require BOTH high angular velocity AND strong acceleration
      // Angular velocity > 200°/s AND acceleration > 15 m/s²
      if (angularVelocity > 200 && magnitude > 15) {
        // Calculate force based on both velocity and acceleration
        const force = Math.min(
          Math.max(angularVelocity / 50 + magnitude / 5, 1),
          10
        );

        console.log(
          "✅ SHOT FIRED! Velocity:",
          angularVelocity.toFixed(0),
          "°/s, Accel:",
          magnitude.toFixed(1),
          "Force:",
          force.toFixed(1)
        );

        setState((prev) => ({
          ...prev,
          isPulledBack: false,
          isCharging: false,
          force,
        }));

        // Trigger the shot callback
        onShotRef.current(force);
        lastShotTimeRef.current = now;
      }

      // Update last values for next comparison
      lastAngleRef.current = angle;
      lastUpdateTimeRef.current = now;
    };

    console.log("📱 Adding DeviceMotion event listener...");
    window.addEventListener("devicemotion", handleMotion);
    console.log("✅ Motion listener added successfully!");

    // Cleanup
    return () => {
      console.log("🧹 Removing motion listener");
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [enabled]); // Only depend on enabled, not onShot

  return state;
};
