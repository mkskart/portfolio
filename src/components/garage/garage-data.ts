export type Badge =
  | "NEW"
  | "CLASSIC"
  | "TRACK ONLY"
  | "HYBRID"
  | "LEGEND"
  | "F1 ENGINE";

export interface TierOneCar {
  id: string;
  name: string;
  year: string;
  badge: Badge | null;
  glb: string;
  hp: string;
  topSpeed: string;
  weight: string;
  why: string;
}

export interface TierTwoCar {
  id: string;
  name: string;
  year: string;
  glb: string;
  hp: string;
  topSpeed: string;
}

export const TIER_ONE: TierOneCar[] = [
  {
    id: "testarossa-classic",
    name: "Ferrari Testarossa",
    year: "1984",
    badge: "CLASSIC",
    glb: "/garage/testarossa-classic.glb",
    hp: "390",
    topSpeed: "181 mph",
    weight: "3,660 lbs",
    why: "The original. Still the most iconic silhouette ever made.",
  },
  {
    id: "testarossa-2025",
    name: "Ferrari Testarossa",
    year: "2025",
    badge: "NEW",
    glb: "/garage/testarossa-2025.glb",
    hp: "986",
    topSpeed: "211 mph",
    weight: "3,197 lbs",
    why: "The icon, reimagined. Side strakes and all.",
  },
  {
    id: "bolide",
    name: "Bugatti Bolide",
    year: "2024",
    badge: "TRACK ONLY",
    glb: "/garage/bolide.glb",
    hp: "1,825",
    topSpeed: "310 mph",
    weight: "2,733 lbs",
    why: "1,825hp. Track-only. Sounds apocalyptic.",
  },
  {
    id: "720s",
    name: "McLaren 720S",
    year: "2019",
    badge: null,
    glb: "/garage/720s.glb",
    hp: "710",
    topSpeed: "212 mph",
    weight: "2,828 lbs",
    why: "The benchmark. Every hypercar gets measured against this.",
  },
  {
    id: "918",
    name: "Porsche 918 Spyder",
    year: "2015",
    badge: "HYBRID",
    glb: "/garage/918.glb",
    hp: "887",
    topSpeed: "214 mph",
    weight: "3,715 lbs",
    why: "Hybrid before hybrid was cool. Nürburgring record holder.",
  },
  {
    id: "r8",
    name: "Audi R8 V10",
    year: "2020",
    badge: null,
    glb: "/garage/r8.glb",
    hp: "602",
    topSpeed: "205 mph",
    weight: "3,583 lbs",
    why: "The everyday supercar. Naturally aspirated V10 screamer.",
  },
  {
    id: "f40",
    name: "Ferrari F40",
    year: "1992",
    badge: "LEGEND",
    glb: "/garage/f40.glb",
    hp: "478",
    topSpeed: "201 mph",
    weight: "2,425 lbs",
    why: "Last Ferrari Enzo personally approved. Raw. Analog. Perfect.",
  },
  {
    id: "zonda",
    name: "Pagani Zonda",
    year: "2000",
    badge: null,
    glb: "/garage/zonda.glb",
    hp: "555",
    topSpeed: "220 mph",
    weight: "2,712 lbs",
    why: "Horacio's magnum opus. Art that does 220mph.",
  },
  {
    id: "amg-one",
    name: "Mercedes-AMG One",
    year: "2023",
    badge: "F1 ENGINE",
    glb: "/garage/amg-one.glb",
    hp: "1,063",
    topSpeed: "219 mph",
    weight: "3,362 lbs",
    why: "A literal Formula 1 engine. In a road car. Insane.",
  },
];

export const TIER_TWO: TierTwoCar[] = [
  {
    id: "nevera",
    name: "Rimac Nevera",
    year: "2023",
    glb: "/garage/nevera.glb",
    hp: "1,914",
    topSpeed: "258 mph",
  },
  {
    id: "countach",
    name: "Lamborghini Countach",
    year: "1988",
    glb: "/garage/countach.glb",
    hp: "455",
    topSpeed: "183 mph",
  },
  {
    id: "rs7",
    name: "Audi RS7",
    year: "2022",
    glb: "/garage/rs7.glb",
    hp: "591",
    topSpeed: "190 mph",
  },
  {
    id: "ttrs",
    name: "Audi TT RS",
    year: "2020",
    glb: "/garage/ttrs.glb",
    hp: "394",
    topSpeed: "174 mph",
  },
  {
    id: "911",
    name: "Porsche 911",
    year: "2022",
    glb: "/garage/911.glb",
    hp: "379",
    topSpeed: "182 mph",
  },
];

export const BADGE_STYLES: Record<Badge, string> = {
  NEW: "bg-red-primary/90 text-white",
  "TRACK ONLY": "bg-red-primary/90 text-white",
  "F1 ENGINE": "bg-red-primary/90 text-white",
  HYBRID: "bg-emerald-600/90 text-white",
  LEGEND: "bg-amber-700/80 text-amber-50",
  CLASSIC: "bg-amber-700/80 text-amber-50",
};
