"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  MeshReflectorMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { GLBCar } from "./glb-car";

// intentional red: car-specific scene lighting (Ferrari/Red Bull aesthetic).

export type ControlsRef = React.RefObject<OrbitControlsImpl | null>;

interface SceneProps {
  glbSrc: string;
  /** Drag rotation + reflective floor + dust motes. Off for inline previews. */
  interactive?: boolean;
  /** Hands the OrbitControls instance back so DOM zoom buttons can drive it. */
  controlsRef?: ControlsRef;
  /** Fires once the GLB has resolved past Suspense (for fading skeletons). */
  onLoaded?: () => void;
}

export function GarageScene({
  glbSrc,
  interactive = true,
  controlsRef,
  onLoaded,
}: SceneProps) {
  return (
    <Canvas
      shadows={interactive}
      gl={{ antialias: true, alpha: !interactive }}
      dpr={[1, 1.6]}
      camera={{ position: [4, 1.8, 4], fov: 40 }}
    >
      {interactive && <color attach="background" args={["#0A0A0A"]} />}
      <fog attach="fog" args={["#0A0A0A", 9, 26]} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        color="#FF2200"
        castShadow={interactive}
      />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#0044FF" />
      <pointLight position={[0, -2, -5]} color="#ffffff" intensity={0.8} distance={14} />
      <pointLight position={[0, -1, 2]} color="#8B0000" intensity={1.5} distance={8} />
      <Environment preset="warehouse" />

      <Suspense fallback={null}>
        {interactive ? (
          <GLBCar src={glbSrc} />
        ) : (
          <AutoRotateWrapper>
            <GLBCar src={glbSrc} bob={false} />
          </AutoRotateWrapper>
        )}
        {onLoaded && <LoadedBeacon onLoaded={onLoaded} />}
      </Suspense>

      {interactive ? (
        <ReflectiveFloor />
      ) : (
        <ContactShadows position={[0, 0, 0]} opacity={0.5} blur={2.6} far={6} />
      )}

      {interactive && <DustMotes count={80} />}

      {interactive && (
        <OrbitControls
          ref={controlsRef}
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minDistance={2.5}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0.5, 0]}
        />
      )}
    </Canvas>
  );
}

/** Tier 2 mini card viewer — non-interactive, auto-rotate, no shadows. */
export function MiniGarageScene({ glbSrc }: { glbSrc: string }) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      camera={{ position: [3, 1.5, 3], fov: 45 }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 3]} intensity={0.9} color="#FF4422" />
      <directionalLight position={[-3, 2, -3]} intensity={0.4} color="#5fb3ff" />
      <Environment preset="warehouse" />
      <Suspense fallback={null}>
        <AutoRotateWrapper speed={0.8}>
          <GLBCar src={glbSrc} bob={false} targetSize={3.6} />
        </AutoRotateWrapper>
      </Suspense>
      <ContactShadows position={[0, 0, 0]} opacity={0.45} blur={2.5} far={5} />
    </Canvas>
  );
}

/**
 * Renders nothing — but its mount inside <Suspense> is the signal that the
 * GLB has resolved. Used to fade out DOM skeletons.
 */
function LoadedBeacon({ onLoaded }: { onLoaded: () => void }) {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    onLoaded();
  });
  return null;
}

function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={512}
        mixBlur={1}
        mixStrength={50}
        roughness={0.85}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0a0a0a"
        metalness={0.4}
        mirror={0.5}
      />
    </mesh>
  );
}

function buildDustPositions(count: number): Float32Array {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 14;
    arr[i * 3 + 1] = Math.random() * 4;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 14;
  }
  return arr;
}

function DustMotes({ count = 80 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const [positions] = useState(() => buildDustPositions(count));
  useFrame((_, dt) => {
    const p = ref.current;
    if (!p) return;
    p.rotation.y += dt * 0.02;
    const arr = (p.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    for (let i = 1; i < arr.length; i += 3) {
      arr[i] += dt * 0.05;
      if (arr[i] > 4) arr[i] = 0;
    }
    (p.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffe6e0"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function AutoRotateWrapper({
  children,
  speed = 0.35,
}: {
  children: React.ReactNode;
  speed?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed;
  });
  return <group ref={ref}>{children}</group>;
}
