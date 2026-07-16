import type { Metadata } from "next";
import BionicArmClient from "@/components/bionic-arm/bionic-arm-client";

export const metadata: Metadata = {
  title: "Bionic Hand — HCRL Simulation",
  description:
    "A browser analog of my Human Centered Robotics Lab research: webcam hand tracking drives a 16-DOF procedural robotic hand in real time, entirely on-device.",
};

export default function BionicArmPage() {
  return <BionicArmClient />;
}
