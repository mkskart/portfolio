"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  /** Public-folder path, e.g. "/f1/loop.webm" — falls back to children if missing. */
  src: string;
  /** Optional MP4 fallback path for browsers without WebM. */
  srcMp4?: string;
  /** Rendered when no video is available — your CSS/SVG fallback. */
  children: React.ReactNode;
  className?: string;
  poster?: string;
}

/**
 * Renders an autoplay/looping video if `src` exists at runtime, otherwise
 * renders `children`. Lets the project ship without binary assets — drop
 * files in `public/...` later and they replace the fallback automatically.
 *
 * Detection: HEAD request on mount. Server-rendered output is always the
 * fallback to avoid hydration mismatch and FOUC.
 */
export function MediaWithFallback({
  src,
  srcMp4,
  children,
  className,
  poster,
}: Props) {
  const [hasVideo, setHasVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(src, { method: "HEAD" })
      .then((r) => {
        if (!cancelled && r.ok) setHasVideo(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!hasVideo) return <>{children}</>;

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      loop
      muted
      playsInline
      poster={poster}
      // preload="auto" buffers the full clip up front so the loop seek is
      // instant — without it the browser only fetches metadata and you can
      // see a stutter on the wrap.
      preload="auto"
      // Promote to its own GPU layer; cheap on a fixed-size element and
      // smooths the loop transition on slower hardware.
      style={{ willChange: "transform" }}
    >
      {/* WebM (VP9) listed first — loops more cleanly than MP4 in Chrome/Firefox. */}
      <source src={src} type={src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
      {srcMp4 && <source src={srcMp4} type="video/mp4" />}
    </video>
  );
}
