// src/utils/aboutData.ts
import {
  Rocket,
  Globe,
  Award,
  Lightbulb,
  BookOpen,
  CircleDashed,
  HeartPulse,
  Sparkles
} from "lucide-react";

import { LucideIcon } from "lucide-react";

export interface JourneyItem {
  year: number;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  achievements: string[];
}

export const journeyData: JourneyItem[] = [
  {
    year: 2018,
    title: "The Beginning",
    description: "Founded with a vision to revolutionize digital experiences",
    icon: Rocket,
    color: "bg-blue-500",
    achievements: [
      "First client project launched",
      "Core team established",
      "Initial design system created"
    ]
  },
  {
    year: 2020,
    title: "Expanding Horizons",
    description: "Pivoted to AI and emerging technologies",
    icon: Lightbulb,
    color: "bg-purple-500",
    achievements: [
      "AI research division formed",
      "First Web3 project delivered",
      "Team doubled in size"
    ]
  },
  {
    year: 2022,
    title: "Breakthrough Year",
    description: "Landmark projects and industry recognition",
    icon: Award,
    color: "bg-yellow-500",
    achievements: [
      "Won 3 industry awards",
      "Partnered with Fortune 500 clients",
      "Opened second studio location"
    ]
  },
  {
    year: 2024,
    title: "Global Presence",
    description: "Expanded operations internationally",
    icon: Globe,
    color: "bg-green-500",
    achievements: [
      "Launched Asia-Pacific division",
      "100+ projects delivered",
      "Recognized as top innovator"
    ]
  },
  {
    year: 2025,
    title: "The Future",
    description: "Pioneering the next generation of digital experiences",
    icon: BookOpen,
    color: "bg-pink-500",
    achievements: [
      "Developing quantum computing solutions",
      "Exploring immersive metaverse experiences",
      "Building sustainable tech initiatives"
    ]
  }
];


export const impactStats = [
  { 
    value: 150, 
    label: "Projects Completed", 
    icon: CircleDashed,
    color: "bg-gradient-to-br from-blue-500 to-cyan-500"
  },
  { 
    value: 98, 
    label: "Client Satisfaction", 
    icon: HeartPulse,
    unit: "%",
    color: "bg-gradient-to-br from-purple-500 to-indigo-500"
  },
  { 
    value: 50, 
    label: "Users Impacted", 
    icon: Globe,
    unit: "M+",
    color: "bg-gradient-to-br from-green-500 to-emerald-500"
  },
  { 
    value: 25, 
    label: "Industry Awards", 
    icon: Award,
    color: "bg-gradient-to-br from-yellow-500 to-amber-500"
  }
];

export const coreValues = [
  {
    icon: Sparkles,
    title: "Innovation",
    description: "We push boundaries to create what doesn't exist yet",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Lightbulb,
    title: "Creativity",
    description: "Finding novel solutions to complex problems",
    color: "from-purple-500 to-indigo-500"
  },
  {
    icon: HeartPulse,
    title: "Passion",
    description: "Loving what we do and doing it exceptionally",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Globe,
    title: "Impact",
    description: "Creating work that matters to the world",
    color: "from-green-500 to-emerald-500"
  }
];
