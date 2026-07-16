"use client";

import { createRef, useMemo, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { REST_POSE, type RoboticHandPose } from "@/lib/hand-kinematics";

// intentional red: the bionic arm is a firmware-mode hero visual (HCRL), so its
// LED/actuator reds are fixed to the firmware accent.

// Finger metacarpal anchor on the palm top edge, per-finger segment lengths,
// and a size scale. Order matches RoboticHandPose.fingers (index → pinky).
const FINGERS = [
  { x: -0.46, base: 0.82, segs: [0.44, 0.34, 0.26], scale: 1.0 },
  { x: -0.15, base: 0.9, segs: [0.5, 0.38, 0.28], scale: 1.08 },
  { x: 0.16, base: 0.84, segs: [0.46, 0.35, 0.27], scale: 1.02 },
  { x: 0.45, base: 0.7, segs: [0.36, 0.28, 0.22], scale: 0.88 },
] as const;

const STEEL = { color: "#c4c8d0", metalness: 0.92, roughness: 0.34 } as const;
const JOINT = { color: "#31343b", metalness: 0.8, roughness: 0.5 } as const;
const SMOOTH_RATE = 12;

/** A single phalanx: a tapered steel segment sitting above its pivot servo. */
function Phalanx({ length, width }: { length: number; width: number }) {
  return (
    <group>
      <mesh position={[0, length / 2, 0]}>
        <boxGeometry args={[width, length, width * 0.9]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      {/* servo pin at the joint */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[width * 0.58, width * 0.58, width * 1.1, 16]} />
        <meshStandardMaterial {...JOINT} />
      </mesh>
    </group>
  );
}

function Fingertip({ scale }: { scale: number }) {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.078 * scale, 14, 14]} />
      <meshStandardMaterial
        color="#E10600"
        emissive="#E10600"
        emissiveIntensity={0.5}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

interface FingerRefs {
  mcp: RefObject<THREE.Group | null>;
  pip: RefObject<THREE.Group | null>;
  dip: RefObject<THREE.Group | null>;
}

/**
 * Procedural industrial robotic hand. The parent mutates `poseRef.current` each
 * frame (from live hand tracking or the idle loop); this component critically-
 * damps every joint toward that target in useFrame — no React state per frame.
 */
export function RoboticHand({ poseRef }: { poseRef: RefObject<RoboticHandPose> }) {
  const fingerRefs = useMemo<FingerRefs[]>(
    () =>
      FINGERS.map(() => ({
        mcp: createRef<THREE.Group>(),
        pip: createRef<THREE.Group>(),
        dip: createRef<THREE.Group>(),
      })),
    [],
  );
  const thumbCmc = useMemo(() => createRef<THREE.Group>(), []);
  const thumbMcp = useMemo(() => createRef<THREE.Group>(), []);
  const thumbIp = useMemo(() => createRef<THREE.Group>(), []);
  const wrist = useMemo(() => createRef<THREE.Group>(), []);
  const wristQ = useMemo(() => new THREE.Quaternion(), []);
  const targetQ = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, dt) => {
    const pose = poseRef.current ?? REST_POSE;
    const k = Math.min(1, dt * SMOOTH_RATE);
    const ease = (g: THREE.Group | null, axis: "x" | "y" | "z", target: number) => {
      if (g) g.rotation[axis] += (target - g.rotation[axis]) * k;
    };

    // Wrist: slerp the whole orientation so palm direction tracks 1:1.
    if (wrist.current) {
      targetQ.set(pose.wrist[0], pose.wrist[1], pose.wrist[2], pose.wrist[3]);
      wristQ.slerp(targetQ, k);
      wrist.current.quaternion.copy(wristQ);
    }

    pose.fingers.forEach((f, i) => {
      ease(fingerRefs[i].mcp.current, "x", f.mcp);
      ease(fingerRefs[i].mcp.current, "z", f.splay);
      ease(fingerRefs[i].pip.current, "x", f.pip);
      ease(fingerRefs[i].dip.current, "x", f.dip);
    });

    ease(thumbCmc.current, "x", pose.thumb.cmc);
    ease(thumbCmc.current, "y", pose.thumb.oppose);
    ease(thumbMcp.current, "x", pose.thumb.mcp);
    ease(thumbIp.current, "x", pose.thumb.ip);
  });

  return (
    <group>
      {/* forearm mount — static; the wrist pivots relative to it */}
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[0.34, 0.44, 1.0, 20]} />
        <meshStandardMaterial color="#2a2d34" metalness={0.9} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.26, 24]} />
        <meshStandardMaterial {...JOINT} />
      </mesh>

      {/* wrist — everything below pivots as one */}
      <group ref={wrist}>
        {/* palm */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[1.24, 1.3, 0.4]} />
          <meshStandardMaterial color="#23262c" metalness={0.85} roughness={0.4} />
        </mesh>
        {/* knuckle bar */}
        <mesh position={[0, 0.82, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 1.15, 16]} />
          <meshStandardMaterial {...JOINT} />
        </mesh>

        {/* four fingers */}
        {FINGERS.map((cfg, i) => (
          <group key={i} ref={fingerRefs[i].mcp} position={[cfg.x, cfg.base, 0]}>
            <Phalanx length={cfg.segs[0]} width={0.17 * cfg.scale} />
            <group ref={fingerRefs[i].pip} position={[0, cfg.segs[0], 0]}>
              <Phalanx length={cfg.segs[1]} width={0.15 * cfg.scale} />
              <group ref={fingerRefs[i].dip} position={[0, cfg.segs[1], 0]}>
                <Phalanx length={cfg.segs[2]} width={0.13 * cfg.scale} />
                <group position={[0, cfg.segs[2], 0]}>
                  <Fingertip scale={cfg.scale} />
                </group>
              </group>
            </group>
          </group>
        ))}

        {/* thumb — anchored low-left, splayed out and forward; three bones */}
        <group position={[-0.58, -0.16, 0.16]} rotation={[0, 0.4, 0.95]}>
          <group ref={thumbCmc}>
            <Phalanx length={0.34} width={0.22} />
            <group ref={thumbMcp} position={[0, 0.34, 0]}>
              <Phalanx length={0.3} width={0.19} />
              <group ref={thumbIp} position={[0, 0.3, 0]}>
                <Phalanx length={0.26} width={0.16} />
                <group position={[0, 0.26, 0]}>
                  <Fingertip scale={1.05} />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
