// Converts MediaPipe's 21 hand landmarks into joint angles that drive the
// procedural robotic hand. Pure math — no React, no three scene objects (only
// three's Vector3/Matrix4/Quaternion as local math helpers). Mirrors the real
// HCRL pipeline: sensor telemetry → per-joint angles → actuated hand.

import { Euler, Matrix4, Quaternion, Vector3 } from "three";

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

/** One finger: flexion at each joint (radians) + lateral splay. */
export interface FingerPose {
  mcp: number; // knuckle flex
  pip: number; // middle joint flex
  dip: number; // fingertip joint flex
  splay: number; // lateral spread (signed)
}

export interface ThumbPose {
  cmc: number; // base flex
  mcp: number; // proximal knuckle flex
  ip: number; // tip flex (the deep curl)
  oppose: number; // rotation across the palm toward the fingers
}

/** Wrist orientation as a quaternion [x, y, z, w] in scene space. */
export type WristQuat = [number, number, number, number];

export interface RoboticHandPose {
  /** index, middle, ring, pinky */
  fingers: [FingerPose, FingerPose, FingerPose, FingerPose];
  thumb: ThumbPose;
  wrist: WristQuat;
}

const IDENTITY_QUAT: WristQuat = [0, 0, 0, 1];

function finger(mcp: number, pip: number, dip: number, splay = 0): FingerPose {
  return { mcp, pip, dip, splay };
}

export const REST_POSE: RoboticHandPose = {
  fingers: [finger(0, 0, 0), finger(0, 0, 0), finger(0, 0, 0), finger(0, 0, 0)],
  thumb: { cmc: 0, mcp: 0, ip: 0, oppose: 0 },
  wrist: IDENTITY_QUAT,
};

// ── landmark → angle helpers ────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function vec(l: Landmark): Vector3 {
  return new Vector3(l.x, l.y, l.z);
}

/**
 * MediaPipe image space (x right, y DOWN, z toward camera negative) → scene
 * space (x right, y up, z toward viewer). X is mirrored so the hand behaves like
 * a selfie and matches the robotic hand's chirality; Y and Z are flipped.
 */
function toScene(l: Landmark): Vector3 {
  return new Vector3(0.5 - l.x, 0.5 - l.y, -l.z);
}

/**
 * Flexion at `joint` given its neighbours. Straight (colinear) → ~0; a right
 * angle → ~π/2. `rest` trims the natural slack so a relaxed finger reads flat.
 */
function flexion(prev: Landmark, joint: Landmark, next: Landmark, rest = 0): number {
  const a = vec(prev).sub(vec(joint));
  const b = vec(next).sub(vec(joint));
  const la = a.length();
  const lb = b.length();
  if (la < 1e-6 || lb < 1e-6) return 0;
  const cos = clamp(a.dot(b) / (la * lb), -1, 1);
  const angle = Math.acos(cos); // π when straight
  return clamp(Math.PI - angle - rest, 0, 2.2);
}

// [prev, joint, next] landmark index triples for each finger's 3 joints.
const FINGER_JOINTS: number[][][] = [
  [[0, 5, 6], [5, 6, 7], [6, 7, 8]], // index
  [[0, 9, 10], [9, 10, 11], [10, 11, 12]], // middle
  [[0, 13, 14], [13, 14, 15], [14, 15, 16]], // ring
  [[0, 17, 18], [17, 18, 19], [18, 19, 20]], // pinky
];

/** Signed lateral splay of a fingertip relative to the palm's forward axis. */
function splayOf(lm: Landmark[], tipIdx: number, right: Vector3, forward: Vector3): number {
  const dir = vec(lm[tipIdx]).sub(vec(lm[0])).normalize();
  const lateral = dir.dot(right);
  const along = dir.dot(forward);
  return clamp(Math.atan2(lateral, Math.abs(along)) * 0.6, -0.5, 0.5);
}

// Small screen-space roll correction (radians) for the natural knuckle-arch
// tilt — the index MCP sits higher than the pinky, tilting the palm's "across"
// axis. Negative counters a slight left lean; flip the sign if it leans more.
const WRIST_ROLL_TRIM: number = -0.12;
const VIEW_AXIS = new Vector3(0, 0, 1);

/**
 * Wrist orientation from the palm's scene-space basis. Built so that a palm
 * facing the camera maps to identity (robotic palm faces the viewer). Returns a
 * quaternion so the hand rotates 1:1 with no gimbal twist or clamping.
 */
function wristQuat(lm: Landmark[]): WristQuat {
  const up = toScene(lm[9]).sub(toScene(lm[0])).normalize(); // wrist → middle MCP
  const t = toScene(lm[5]).sub(toScene(lm[17])).normalize(); // index → pinky
  const normal = new Vector3().crossVectors(up, t); // palm normal (toward viewer)
  if (normal.lengthSq() < 1e-8) return IDENTITY_QUAT;
  normal.normalize();
  const across = new Vector3().crossVectors(up, normal).normalize();
  const m = new Matrix4().makeBasis(across, up, normal);
  const q = new Quaternion().setFromRotationMatrix(m);
  if (WRIST_ROLL_TRIM !== 0) {
    // World-space roll about the view axis so the base pose sits level.
    q.premultiply(new Quaternion().setFromAxisAngle(VIEW_AXIS, WRIST_ROLL_TRIM));
  }
  return [q.x, q.y, q.z, q.w];
}

export function landmarksToHandPose(lm: Landmark[]): RoboticHandPose {
  if (lm.length < 21) return REST_POSE;

  // Raw palm axes, used only for lateral splay (angle-invariant to the flip).
  const right = vec(lm[5]).sub(vec(lm[17])).normalize();
  const forward = vec(lm[9]).sub(vec(lm[0])).normalize();

  const fingers = FINGER_JOINTS.map((joints, i) => {
    const tip = [8, 12, 16, 20][i];
    return finger(
      flexion(lm[joints[0][0]], lm[joints[0][1]], lm[joints[0][2]], 0.35),
      flexion(lm[joints[1][0]], lm[joints[1][1]], lm[joints[1][2]], 0.1),
      flexion(lm[joints[2][0]], lm[joints[2][1]], lm[joints[2][2]], 0.1),
      splayOf(lm, tip, right, forward),
    );
  }) as [FingerPose, FingerPose, FingerPose, FingerPose];

  // Thumb — three joints, reading the ones that actually move: MCP (lm 1-2-3)
  // and IP (lm 2-3-4, the deep tip curl), plus a light CMC base bend. Strong
  // gains, capped per segment so three bones curl deep without self-intersecting.
  const thumbToPinky = vec(lm[4]).distanceTo(vec(lm[17]));
  const thumb: ThumbPose = {
    cmc: clamp(flexion(lm[0], lm[1], lm[2], 0.1) * 1.3, 0, 1.1),
    mcp: clamp(flexion(lm[1], lm[2], lm[3], 0.05) * 1.7, 0, 1.9),
    ip: clamp(flexion(lm[2], lm[3], lm[4], 0.03) * 1.8, 0, 2.0),
    oppose: clamp((1 - thumbToPinky * 3.0) * 2.0, 0, 1.7),
  };

  return { fingers, thumb, wrist: wristQuat(lm) };
}

// ── idle gesture loop (fallback / homepage preview) ─────────────────────────

function eulerQuat(x: number, y: number, z: number): WristQuat {
  const q = new Quaternion().setFromEuler(new Euler(x, y, z, "XYZ"));
  return [q.x, q.y, q.z, q.w];
}

const OPEN = REST_POSE;
const FIST: RoboticHandPose = {
  fingers: [finger(1.5, 1.7, 1.0), finger(1.5, 1.7, 1.0), finger(1.5, 1.7, 1.0), finger(1.5, 1.7, 1.0)],
  thumb: { cmc: 0.5, mcp: 1.1, ip: 1.3, oppose: 1.5 },
  wrist: IDENTITY_QUAT,
};
const POINT: RoboticHandPose = {
  fingers: [finger(0, 0, 0), finger(1.5, 1.7, 1.0), finger(1.5, 1.7, 1.0), finger(1.5, 1.7, 1.0)],
  thumb: { cmc: 0.4, mcp: 0.7, ip: 0.9, oppose: 1.1 },
  wrist: eulerQuat(0.15, -0.2, 0),
};
const SPREAD: RoboticHandPose = {
  fingers: [
    finger(0, 0, 0, -0.35),
    finger(0, 0, 0, -0.12),
    finger(0, 0, 0, 0.12),
    finger(0, 0, 0, 0.35),
  ],
  thumb: { cmc: 0.15, mcp: 0.1, ip: 0.1, oppose: 0 },
  wrist: eulerQuat(-0.1, 0.28, 0.1),
};

const IDLE_SEQUENCE: RoboticHandPose[] = [OPEN, SPREAD, FIST, POINT, FIST, OPEN];
const IDLE_STEP_SECONDS = 1.6;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpFinger(a: FingerPose, b: FingerPose, t: number): FingerPose {
  return {
    mcp: lerp(a.mcp, b.mcp, t),
    pip: lerp(a.pip, b.pip, t),
    dip: lerp(a.dip, b.dip, t),
    splay: lerp(a.splay, b.splay, t),
  };
}

function slerpQuat(a: WristQuat, b: WristQuat, t: number): WristQuat {
  const qa = new Quaternion(a[0], a[1], a[2], a[3]);
  const qb = new Quaternion(b[0], b[1], b[2], b[3]);
  qa.slerp(qb, t);
  return [qa.x, qa.y, qa.z, qa.w];
}

export function lerpPose(a: RoboticHandPose, b: RoboticHandPose, t: number): RoboticHandPose {
  return {
    fingers: [
      lerpFinger(a.fingers[0], b.fingers[0], t),
      lerpFinger(a.fingers[1], b.fingers[1], t),
      lerpFinger(a.fingers[2], b.fingers[2], t),
      lerpFinger(a.fingers[3], b.fingers[3], t),
    ],
    thumb: {
      cmc: lerp(a.thumb.cmc, b.thumb.cmc, t),
      mcp: lerp(a.thumb.mcp, b.thumb.mcp, t),
      ip: lerp(a.thumb.ip, b.thumb.ip, t),
      oppose: lerp(a.thumb.oppose, b.thumb.oppose, t),
    },
    wrist: slerpQuat(a.wrist, b.wrist, t),
  };
}

/** Smooth-cosine ease for the idle interpolation. */
function smooth(t: number): number {
  return 0.5 - 0.5 * Math.cos(Math.PI * t);
}

/** Pose at time `seconds` while cycling the idle gesture sequence. */
export function idlePose(seconds: number): RoboticHandPose {
  const total = IDLE_SEQUENCE.length;
  const phase = (seconds / IDLE_STEP_SECONDS) % total;
  const i = Math.floor(phase);
  const t = smooth(phase - i);
  return lerpPose(IDLE_SEQUENCE[i], IDLE_SEQUENCE[(i + 1) % total], t);
}
