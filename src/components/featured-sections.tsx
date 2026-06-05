"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMode } from "@/lib/mode-context";
import { MODE_CONTENT } from "@/lib/mode-content";
import { projectById } from "@/lib/projects-data";
import { TradingSection } from "@/components/trading/trading-section";
import { LiteWingSection } from "@/components/litewing/litewing-section";
import { ProjectSpotlight } from "@/components/project-spotlight";

/**
 * Renders the per-mode headliner project (the featured entry of the active
 * mode's projectOrder). LiteWing and QuantClaw have bespoke sections;
 * everything else falls back to a ProjectSpotlight.
 */
function renderFeatured(id: string, anchorId?: string) {
  if (id === "litewing") return <LiteWingSection />;
  if (id === "quantclaw") return <TradingSection />;
  const project = projectById(id);
  if (!project) return null;
  return <ProjectSpotlight project={project} id={anchorId} />;
}

export function FeaturedSections() {
  const { mode } = useMode();
  const [primaryId] = MODE_CONTENT[mode].projectOrder;

  // TradingSection/LiteWingSection carry their own ids; for the work-anchor we
  // place an explicit anchor before the primary so /#work resolves in any mode.
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <span id="work" aria-hidden className="block" />
        {renderFeatured(primaryId)}
      </motion.div>
    </AnimatePresence>
  );
}
