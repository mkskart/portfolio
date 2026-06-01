import { F1Section } from "./f1-section";
import { GarageSection } from "./garage-section";
import { ViolinSection } from "./violin-section";

export function HobbiesStack() {
  return (
    <>
      <F1Section id="hobbies" />
      <GarageSection id="hobbies-garage" />
      <ViolinSection id="hobbies-violin" />
    </>
  );
}
