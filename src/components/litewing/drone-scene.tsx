"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/lib/reduced-motion";

const TILT_MAX = 0.262; // ±15° in radians
const STIFFNESS = 200;
const DAMPING = 15;

function Drone({ onMove }: { onMove: () => void }) {
  const root = useRef<THREE.Group>(null!);
  const propsGroup = useRef<THREE.Group>(null!);
  const { mouse } = useThree();
  const vel = useRef({ z: 0, x: 0 });
  const lastMouse = useRef({ x: 0, y: 0 });

  useFrame((state, dt) => {
    const r = root.current;
    if (r) {
      const t = state.clock.elapsedTime;
      // Idle bob — bigger so it's visibly alive
      r.position.y = Math.sin(t * 1.4) * 0.15;

      // Spring physics toward cursor target
      const targetZ = -mouse.x * TILT_MAX;
      // cursor up → drone pitches forward (away from viewer, top dipping down)
      const targetX = -mouse.y * TILT_MAX * 0.7;
      const aZ = (targetZ - r.rotation.z) * STIFFNESS - vel.current.z * DAMPING;
      const aX = (targetX - r.rotation.x) * STIFFNESS - vel.current.x * DAMPING;
      vel.current.z += aZ * dt;
      vel.current.x += aX * dt;
      r.rotation.z += vel.current.z * dt;
      r.rotation.x += vel.current.x * dt;

      // Detect first interaction
      if (
        Math.abs(mouse.x - lastMouse.current.x) > 0.02 ||
        Math.abs(mouse.y - lastMouse.current.y) > 0.02
      ) {
        onMove();
        lastMouse.current.x = mouse.x;
        lastMouse.current.y = mouse.y;
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
            <mesh position={[pos[0], 0.05, pos[2]]}>
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

export function DroneScene({ onInteract }: { onInteract?: () => void }) {
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
      <Drone onMove={fire} />
    </Canvas>
  );
}
