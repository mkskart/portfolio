"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/lib/reduced-motion";

// intentional red: the LiteWing drone is a firmware-only hero visual (the
// section is only featured in firmware mode), so its LED/light reds are fixed.

export type ControlMode = "cursor" | "hand";

export interface HandPose {
  /** -1..1, signed horizontal palm-center position in viewport space */
  x: number;
  /** -1..1, signed vertical palm-center position (positive = up) */
  y: number;
  /** 0..1, hand openness proxy (index-fingertip → wrist span) */
  z: number;
  /** True when ≥3 fingertips are curled toward their MCP joints */
  isFist: boolean;
}

const CURSOR_TILT_MAX = 15 * (Math.PI / 180); // ±15°
const HAND_TILT_MAX = 28 * (Math.PI / 180); // ±28°
const CURSOR_STIFFNESS = 200;
const CURSOR_DAMPING = 15;
const HAND_STIFFNESS = 380;
const HAND_DAMPING = 18;
const FLIP_DURATION = 0.9;

interface DroneProps {
  mode: ControlMode;
  externalPose: HandPose | null;
  isFlipping: boolean;
  onMove: () => void;
}

function Drone({ mode, externalPose, isFlipping, onMove }: DroneProps) {
  const root = useRef<THREE.Group>(null!);
  const propsGroup = useRef<THREE.Group>(null!);
  const { mouse } = useThree();
  const vel = useRef({ z: 0, x: 0 });
  const lastMouse = useRef({ x: 0, y: 0 });
  // Flip refs: progress is 0..1; the in-flight flag is what we actually
  // animate against, so a brief prop blip doesn't cut the animation short.
  const flipProgress = useRef(0);
  const flipActive = useRef(false);

  useFrame((state, dt) => {
    const r = root.current;
    if (r) {
      const t = state.clock.elapsedTime;
      r.position.y = Math.sin(t * 1.4) * 0.15;

      // Rising-edge: start a fresh flip when the prop turns true.
      if (isFlipping && !flipActive.current) {
        flipActive.current = true;
        flipProgress.current = 0;
      }

      if (flipActive.current) {
        flipProgress.current += dt / FLIP_DURATION;
        if (flipProgress.current >= 1) {
          flipActive.current = false;
          flipProgress.current = 1;
          // Snap back to neutral so the spring has a clean starting point.
          r.rotation.z = 0;
          vel.current.z = 0;
        } else {
          const tt = flipProgress.current;
          const eased = tt < 0.5 ? 2 * tt * tt : -1 + (4 - 2 * tt) * tt;
          r.rotation.z = eased * Math.PI * 2;
        }
      } else {
        const useHand = mode === "hand" && externalPose !== null;
        const inputX = useHand ? externalPose.x : mouse.x;
        const inputY = useHand ? externalPose.y : mouse.y;

        const tiltMax = mode === "hand" ? HAND_TILT_MAX : CURSOR_TILT_MAX;
        const stiffness = mode === "hand" ? HAND_STIFFNESS : CURSOR_STIFFNESS;
        const damping = mode === "hand" ? HAND_DAMPING : CURSOR_DAMPING;

        const targetZ = -inputX * tiltMax;
        // cursor/hand up → drone pitches forward
        const targetX = -inputY * tiltMax * (useHand ? 1.0 : 0.7);
        const aZ = (targetZ - r.rotation.z) * stiffness - vel.current.z * damping;
        const aX = (targetX - r.rotation.x) * stiffness - vel.current.x * damping;
        vel.current.z += aZ * dt;
        vel.current.x += aX * dt;
        r.rotation.z += vel.current.z * dt;
        r.rotation.x += vel.current.x * dt;

        // First-interaction detection (cursor mode only — drives the homepage hint)
        if (mode === "cursor") {
          if (
            Math.abs(mouse.x - lastMouse.current.x) > 0.02 ||
            Math.abs(mouse.y - lastMouse.current.y) > 0.02
          ) {
            onMove();
            lastMouse.current.x = mouse.x;
            lastMouse.current.y = mouse.y;
          }
        }
      }
    }
    const pg = propsGroup.current;
    if (pg) {
      for (const child of pg.children) {
        child.rotation.y += dt * 24;
      }
    }
  });

  const armPositions: [number, number, number][] = [
    [0.7, 0, 0.7],
    [-0.7, 0, 0.7],
    [0.7, 0, -0.7],
    [-0.7, 0, -0.7],
  ];

  return (
    <group ref={root} rotation={[0.25, 0.6, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.45, 0.18, 0.45]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} emissive="#100" />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#FF1744" emissive="#FF1744" emissiveIntensity={1.4} />
      </mesh>
      {armPositions.map((pos, i) => {
        const angle = Math.atan2(pos[2], pos[0]);
        return (
          <group key={i}>
            <group position={[pos[0] / 2, 0, pos[2] / 2]} rotation={[0, -angle, 0]}>
              <mesh>
                <boxGeometry args={[Math.hypot(pos[0], pos[2]), 0.06, 0.07]} />
                <meshStandardMaterial color="#222" metalness={0.8} roughness={0.4} />
              </mesh>
            </group>
            <mesh position={[pos[0], 0.05, pos[2]]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.08, 18]} />
              <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        );
      })}
      <group ref={propsGroup}>
        {armPositions.map((pos, i) => (
          <group key={i} position={[pos[0], 0.11, pos[2]]}>
            <mesh>
              <boxGeometry args={[0.7, 0.008, 0.04]} />
              <meshStandardMaterial color="#FF1744" transparent opacity={0.55} />
            </mesh>
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[0.7, 0.008, 0.04]} />
              <meshStandardMaterial color="#FF1744" transparent opacity={0.55} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

interface DroneSceneProps {
  /** Default `cursor` for the homepage tile; `/litewing` flips to `hand` after permission. */
  mode?: ControlMode;
  /** Latest hand pose from MediaPipe; consumed only when mode === "hand". */
  externalPose?: HandPose | null;
  /** Rising-edge trigger from the page — true for ~900ms while a flip plays. */
  isFlipping?: boolean;
  onInteract?: () => void;
}

export function DroneScene({
  mode = "cursor",
  externalPose = null,
  isFlipping = false,
  onInteract,
}: DroneSceneProps) {
  const reduced = usePrefersReducedMotion();
  const fired = useRef(false);
  const fire = () => {
    if (fired.current) return;
    fired.current = true;
    onInteract?.();
  };

  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.6]}
      camera={{ position: [2.4, 1.8, 2.6], fov: 42 }}
      frameloop={reduced ? "demand" : "always"}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} />
      <pointLight position={[-3, 2, -2]} color="#FF1744" intensity={2} distance={10} />
      <Drone
        mode={mode}
        externalPose={externalPose}
        isFlipping={isFlipping}
        onMove={fire}
      />
    </Canvas>
  );
}
