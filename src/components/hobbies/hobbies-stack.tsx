import { F1Section } from "./f1-section";
import { GarageSection } from "./garage-section";
import { SpotifySection } from "./spotify-section";
import { ViolinSection } from "./violin-section";

export function HobbiesStack() {
  return (
    <>
      <F1Section id="hobbies" />
      <GarageSection id="hobbies-garage" />
      <SpotifySection id="hobbies-spotify" />
      <ViolinSection id="hobbies-violin" />
    </>
  );
}
