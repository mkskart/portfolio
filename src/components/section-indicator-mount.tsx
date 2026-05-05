"use client";

import { usePathname } from "next/navigation";
import { SectionIndicator } from "./section-indicator";

export function SectionIndicatorMount() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <SectionIndicator />;
}
