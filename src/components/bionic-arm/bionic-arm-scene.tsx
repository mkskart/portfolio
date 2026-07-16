"use client";

import { useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  REST_POSE,
  idlePose,
  landmarksToHandPose,
  type Landmark,
  type RoboticHandPose,
} from "@/lib/hand-kinematics";
import { usePrefersReducedMotion } from "@/lib/reduced-motion";
import { RoboticHand } from "./robotic-hand";

interface DriverProps {
  poseRef: RefObject<RoboticHandPose>;
  landmarksRef?: RefObject<Landmark[] | null>;
  interactive: boolean;
  reducedMotion: boolean;
}

/** Feeds the pose target each frame: live landmarks, relaxed rest, or idle loop. */
function HandDriver({ poseRef, landmarksRef, interactive, reducedMotion }: DriverProps) {
  useFrame((state) => {
    if (interactive) {
      const lm = landmarksRef?.current ?? null;
      // Hand lost from frame → relax open rather than snapping into the idle loop.
      poseRef.current = lm && lm.length >= 21 ? landmarksToHandPose(lm) : REST_POSE;
    } else if (reducedMotion) {
      poseRef.current = REST_POSE;
    } else {
      poseRef.current = idlePose(state.clock.elapsedTime);
    }
  });
  return null;
}

function SpinWrap({
  autoRotate,
  children,
}: {
  autoRotate: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (autoRotate && ref.current) ref.current.rotation.y += dt * 0.3;
  });
  return <group ref={ref}>{children}</group>;
}

interface Props {
  /** Live hand-tracked mode; when false the hand runs an idle gesture loop. */
  interactive?: boolean;
  /** Latest MediaPipe landmarks (interactive mode). Null when no hand is seen. */
  landmarksRef?: RefObject<Landmark[] | null>;
  /** Enable OrbitControls (dedicated page) vs. a passive auto-rotating preview. */
  controls?: boolean;
  autoRotate?: boolean;
}

export function BionicArmScene({
  interactive = false,
  landmarksRef,
  controls = false,
  autoRotate = true,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const poseRef = useRef<RoboticHandPose>(REST_POSE);

  // Fresh ref identity if any driving input flips — cheap and avoids stale closures.
  const key = useMemo(() => `${interactive}-${controls}`, [interactive, controls]);

  return (
    <Canvas
      key={key}
      camera={{ position: [0, 0.35, 5.9], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#88aaff" />
      <pointLight position={[0, 1.2, 3]} intensity={12} color="#E10600" distance={11} decay={2} />

      <HandDriver
        poseRef={poseRef}
        landmarksRef={landmarksRef}
        interactive={interactive}
        reducedMotion={reduced}
      />

      <group position={[0, 0.05, 0]}>
        <SpinWrap autoRotate={autoRotate && !interactive && !reduced}>
          <RoboticHand poseRef={poseRef} />
        </SpinWrap>
      </group>

      {controls && (
        <OrbitControls
          enablePan={false}
          minDistance={3.5}
          maxDistance={9}
          target={[0, 0.2, 0]}
        />
      )}
    </Canvas>
  );
}
