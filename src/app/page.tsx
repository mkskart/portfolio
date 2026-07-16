import type { Metadata } from "next";
import { Hero } from "@/components/hero/hero";
import { Intro } from "@/components/intro";
import { Experience } from "@/components/experience";
import { FeaturedSections } from "@/components/featured-sections";
import { OtherWork } from "@/components/other-work";
import { HobbiesStack } from "@/components/hobbies/hobbies-stack";
import { Contact } from "@/components/contact";

const MODE_DESCRIPTIONS: Record<string, string> = {
  firmware:
    "Embedded systems engineer — production nRF9160 firmware, FreeRTOS flight controllers, Zephyr RTOS.",
  quant:
    "Algorithmic trader and ML engineer — genetic algorithm trading strategies, transformer models, live paper trading.",
  swe: "Full-stack software engineer — agentic AI systems, microservices, production deployments.",
  default:
    "ECE @ UT Austin. Embedded engineer, algorithmic trader, and professional violinist.",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}): Promise<Metadata> {
  const { mode } = await searchParams;
  const description = MODE_DESCRIPTIONS[mode ?? "default"] ?? MODE_DESCRIPTIONS.default;

  return {
    description,
    openGraph: { description },
    twitter: { description },
  };
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <Experience />
      <FeaturedSections />
      <OtherWork />
      <HobbiesStack />
      <Contact />
    </>
  );
}
