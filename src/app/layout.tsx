import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { EasterEggLayer } from "@/components/easter-eggs/easter-egg-layer";
import { SectionIndicatorMount } from "@/components/section-indicator-mount";
import { ModeProvider } from "@/lib/mode-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kartheekkmukkavilli.com"),
  title: {
    default: "Kartheek Mukkavilli — Embedded · ML · Trading",
    template: "%s · Kartheek Mukkavilli",
  },
  description:
    "ECE @ UT Austin building embedded systems, training transformers for bionic hands, and running QuantClaw, an algorithmic trading engine.",
  keywords: [
    "Kartheek Mukkavilli",
    "UT Austin",
    "embedded systems",
    "machine learning",
    "algorithmic trading",
    "Zephyr RTOS",
    "nRF9160",
    "ESP32",
    "PyTorch",
  ],
  authors: [{ name: "Kartheek Mukkavilli" }],
  openGraph: {
    title: "Kartheek Mukkavilli",
    description:
      "Embedded systems, machine learning, and QuantClaw — an algorithmic trading engine — built by an ECE rising junior at UT Austin.",
    url: "https://kartheekkmukkavilli.com",
    siteName: "Kartheek Mukkavilli",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kartheek Mukkavilli",
    description:
      "Embedded systems, machine learning, and QuantClaw — an algorithmic trading engine.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg-base text-text-primary selection:bg-red-primary">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Kartheek Mukkavilli",
              jobTitle: "Electrical and Computer Engineering Student",
              alumniOf: {
                "@type": "CollegeOrUniversity",
                name: "The University of Texas at Austin",
              },
              url: "https://kartheekkmukkavilli.com",
              email: "mailto:kartheek.mukkavilli@gmail.com",
              sameAs: [
                "https://www.linkedin.com/in/kartheek-mukkavilli/",
                "https://github.com/mkskart",
                "https://www.instagram.com/kartheek.k.mukkavilli/",
              ],
              knowsAbout: [
                "Embedded Systems",
                "Machine Learning",
                "Algorithmic Trading",
                "Zephyr RTOS",
                "PyTorch",
              ],
            }),
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-bg-elevated focus:px-3 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <ModeProvider>
          <Nav />
          <SectionIndicatorMount />
          <main id="main" className="relative">
            {children}
          </main>
          <EasterEggLayer />
        </ModeProvider>
      </body>
    </html>
  );
}
