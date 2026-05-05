"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface GLBCarProps {
  /** Public path to the .glb file (e.g. "/garage/bolide.glb") */
  src: string;
  /** Target maximum extent (in world units) after auto-fit. */
  targetSize?: number;
  /** Subtle vertical bob. Set false for static (e.g. inside Tier 2 mini viewer). */
  bob?: boolean;
}

/**
 * Per-car Y nudges in world units, applied AFTER bbox normalization.
 * Some GLBs include hidden meshes below the wheels (shadow planes, debug
 * geometry) that pull bbox.min.y down, which makes the visible car float.
 * Negative values push the model down toward the floor.
 */
const Y_OFFSETS: Record<string, number> = {
  f40: -0.15,
  "testarossa-classic": -0.12,
};

/**
 * Loads a GLB and normalizes it: centers + scales the model so its largest
 * dimension equals `targetSize`. Drops the model so its base sits on y=0
 * (the reflective floor lives at y=-0.36 in the scene).
 */
export function GLBCar({ src, targetSize = 4.2, bob = true }: GLBCarProps) {
  // Derive id from `/garage/<id>.glb` so callers don't have to pass it
  // separately; used to look up per-model Y nudges.
  const carId = src.split("/").pop()?.replace(/\.glb$/, "");
  const { scene } = useGLTF(src);

  // Clone so multiple mounts of the same GLB don't share transforms.
  // Memoize against `scene` identity (changes when the GLB swaps).
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Some exporters bake transparent flags that crater perf — strip
        // unless an actual alpha map exists.
        const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
        if (mat && mat.transparent && !mat.alphaMap && (mat.opacity ?? 1) >= 0.99) {
          mat.transparent = false;
        }
      }
    });
    return c;
  }, [scene]);

  // Bounding-box normalization (computed once per cloned scene).
  // After applying scale `s` and position `offset`, the model's XZ-center
  // lands on the origin and its lowest point (box.min.y) rests on y=0.
  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxExtent = Math.max(size.x, size.y, size.z) || 1;
    const s = targetSize / maxExtent;

    const yNudge = (carId && Y_OFFSETS[carId]) || 0;

    return {
      scale: s,
      offset: new THREE.Vector3(
        -center.x * s,
        -box.min.y * s + yNudge,
        -center.z * s,
      ),
    };
  }, [cloned, targetSize, carId]);

  const root = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!root.current || !bob) return;
    root.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.04;
  });

  // Free GPU memory on unmount — combined with single-active-model loading,
  // this keeps memory bounded as the user navigates.
  useEffect(() => {
    return () => {
      useGLTF.clear(src);
    };
  }, [src]);

  return (
    <group ref={root}>
      <group scale={scale} position={offset}>
        <primitive object={cloned} />
      </group>
    </group>
  );
}
