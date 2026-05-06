"use client";

import { useEffect, useRef } from "react";
import type { HandPose } from "./drone-scene";

interface Props {
  onHandPose: (pose: HandPose) => void;
  active: boolean;
}

type Landmark = { x: number; y: number; z: number };

// Palm center = wrist + 4 knuckle MCPs. More stable than wrist alone, which
// drifts low when fingers flex.
const PALM_INDICES = [0, 5, 9, 13, 17];
// Fingertip → MCP pairs. A curled finger collapses this distance below ~0.08
// in normalized coords.
const FINGERTIP_MCPS: ReadonlyArray<readonly [number, number]> = [
  [8, 5],
  [12, 9],
  [16, 13],
  [20, 17],
];
const FIST_THRESHOLD = 0.08;
// Hand movements are smaller-amplitude than mouse swings, so amplify before
// clamping back to ±1.
const HAND_SENSITIVITY = 1.6;

function detectFist(landmarks: Landmark[]): boolean {
  let curled = 0;
  for (const [tip, mcp] of FINGERTIP_MCPS) {
    const t = landmarks[tip];
    const m = landmarks[mcp];
    if (Math.hypot(t.x - m.x, t.y - m.y) < FIST_THRESHOLD) curled += 1;
  }
  return curled >= 3;
}

function clamp(v: number): number {
  return Math.max(-1, Math.min(1, v));
}

/**
 * MediaPipe Hands runs entirely client-side — the WASM decoder is fetched
 * from the jsdelivr CDN, fed frames from a getUserMedia stream, and emits
 * 21 hand landmarks per detection. We extract the wrist (index 0) for the
 * drone's roll/pitch target, plus the index-fingertip→wrist span as a
 * cheap depth proxy. No video data ever leaves the device.
 */
export function WebcamPiP({ onHandPose, active }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let cancelled = false;
    let handsInstance: import("@mediapipe/hands").Hands | null = null;
    let cameraInstance: import("@mediapipe/camera_utils").Camera | null = null;

    async function init() {
      // Heavy — only loaded when the user actually enables hand control.
      const [{ Hands, HAND_CONNECTIONS }, { Camera }, { drawConnectors, drawLandmarks }] =
        await Promise.all([
          import("@mediapipe/hands"),
          import("@mediapipe/camera_utils"),
          import("@mediapipe/drawing_utils"),
        ]);
      if (cancelled || !video || !canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      handsInstance = new Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });
      handsInstance.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      handsInstance.onResults((results) => {
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Mirror so the user sees a selfie-style view
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(
          results.image as CanvasImageSource,
          0,
          0,
          canvas.width,
          canvas.height,
        );
        ctx.restore();

        const hands = results.multiHandLandmarks;
        if (hands && hands.length > 0) {
          const landmarks = hands[0];

          // Skeleton overlay (also mirrored)
          ctx.save();
          ctx.scale(-1, 1);
          ctx.translate(-canvas.width, 0);
          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
            color: "#E10600",
            lineWidth: 1,
          });
          drawLandmarks(ctx, landmarks, {
            color: "#FF1744",
            lineWidth: 1,
            radius: 2,
          });
          ctx.restore();

          // Pose: palm center drives X/Y; (index-tip 8 → wrist) span is the depth proxy.
          let palmX = 0;
          let palmY = 0;
          for (const i of PALM_INDICES) {
            palmX += landmarks[i].x;
            palmY += landmarks[i].y;
          }
          palmX /= PALM_INDICES.length;
          palmY /= PALM_INDICES.length;

          const wrist = landmarks[0];
          const indexTip = landmarks[8];
          const span = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
          const z = Math.min(1, span * 5);

          // Mirror X so the drone tracks the user's perspective in the
          // mirrored feed. Sensitivity multiplier amplifies before clamping.
          const x = clamp((0.5 - palmX) * 2 * HAND_SENSITIVITY);
          const y = clamp((0.5 - palmY) * 2 * HAND_SENSITIVITY);
          const isFist = detectFist(landmarks);

          onHandPose({ x, y, z, isFist });
        }
      });

      cameraInstance = new Camera(video, {
        onFrame: async () => {
          if (handsInstance && video.readyState >= 2) {
            await handsInstance.send({ image: video });
          }
        },
        width: 320,
        height: 240,
      });
      await cameraInstance.start();
    }

    init().catch((err) => {
      // If init throws (e.g. WASM CDN blocked) we just leave the PiP empty —
      // the caller's status hint already communicates the state.
      console.error("MediaPipe init failed:", err);
    });

    return () => {
      cancelled = true;
      cameraInstance?.stop().catch(() => {});
      handsInstance?.close().catch(() => {});
      // Belt-and-suspenders: stop any tracks the Camera class attached.
      const stream = video.srcObject as MediaStream | null;
      if (stream) {
        for (const track of stream.getTracks()) track.stop();
      }
    };
  }, [active, onHandPose]);

  return (
    <div className="relative h-36 w-48 overflow-hidden rounded border border-red-primary/50 bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-0"
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute left-2 top-2 font-mono text-[9px] uppercase tracking-widest text-red-glow">
        Hand tracking
      </div>
      <div className="absolute bottom-2 right-2 font-mono text-[9px] text-emerald-400">
        ● LIVE
      </div>
    </div>
  );
}
