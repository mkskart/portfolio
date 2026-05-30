import type { Metadata } from "next";
import { ResumeClient } from "@/components/resume/resume-client";

export const metadata: Metadata = {
  title: "Resume",
  description: "Resume — Kartheek Mukkavilli, ECE @ UT Austin",
};

export default function ResumePage() {
  return <ResumeClient />;
}
