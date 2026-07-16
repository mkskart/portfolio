"use client";

import { useEffect, useRef } from "react";
import type { Landmark } from "@/lib/hand-kinematics";

// intentional red: firmware-mode (HCRL) hero visual — REC/skeleton reds fixed.

interface Props {
  /** Raw 21 landmarks each frame, or null when no hand is detected. */
  onLandmarks: (landmarks: Landmark[] | null) => void;
  active: boolean;
}

/**
 * MediaPipe Hands runs entirely client-side: the WASM decoder is fetched from
 * the jsdelivr CDN, fed frames from a getUserMedia stream, and emits 21 hand
 * landmarks per detection. We forward the raw landmarks to the parent (which
 * feeds the robotic-hand kinematics) and paint a mirrored skeleton overlay.
 * No video data ever leaves the device.
 */
export function HandCamera({ onLandmarks, active }: Props) {
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
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
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
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(results.image as CanvasImageSource, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        const hands = results.multiHandLandmarks;
        if (hands && hands.length > 0) {
          const landmarks = hands[0];
          ctx.save();
          ctx.scale(-1, 1);
          ctx.translate(-canvas.width, 0);
          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: "#E10600", lineWidth: 1.5 });
          drawLandmarks(ctx, landmarks, { color: "#FF1744", lineWidth: 1, radius: 2 });
          ctx.restore();
          onLandmarks(landmarks as Landmark[]);
        } else {
          onLandmarks(null);
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
      console.error("MediaPipe init failed:", err);
    });

    return () => {
      cancelled = true;
      cameraInstance?.stop().catch(() => {});
      handsInstance?.close().catch(() => {});
      const stream = video.srcObject as MediaStream | null;
      if (stream) for (const track of stream.getTracks()) track.stop();
      onLandmarks(null);
    };
  }, [active, onLandmarks]);

  return (
    <div className="relative h-36 w-48 overflow-hidden rounded border border-red-primary/50 bg-black">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover opacity-0" playsInline muted />
      <canvas ref={canvasRef} width={320} height={240} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute left-2 top-2 font-mono text-[9px] uppercase tracking-widest text-red-glow">
        Hand tracking
      </div>
      <div className="absolute bottom-2 right-2 font-mono text-[9px] text-emerald-400">● LIVE</div>
    </div>
  );
}
