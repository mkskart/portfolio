import { Hero } from "@/components/hero/hero";
import { Intro } from "@/components/intro";
import { TradingSection } from "@/components/trading/trading-section";
import { LiteWingSection } from "@/components/litewing/litewing-section";
import { OtherWork } from "@/components/other-work";
import { HobbiesStack } from "@/components/hobbies/hobbies-stack";
import { Contact } from "@/components/contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <TradingSection />
      <LiteWingSection />
      <OtherWork />
      <HobbiesStack />
      <Contact />
    </>
  );
}
