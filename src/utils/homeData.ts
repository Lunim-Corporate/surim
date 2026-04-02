import {
  Search,
  Rocket,
  Target,
  UserStar,
  Cpu,
  Kanban,
  Images,
  Telescope as TelescopeIcon,
  Brain as BrainIcon,
  Network as NetworkIcon,
  PersonStanding
} from "lucide-react";
import type { StaticImageData } from "next/image";

import aiAgentImage from "../assets/ai-agent-listing.png";
import aiWhatsAppImage from "../assets/ai-whatsapp-listing.png";
import nftCollectionImage from "../assets/nft-collection-listing.png";
import pizzaHutImage from "../assets/pizza-hut-listing.png";
import toucanBoxImage from "../assets/toucanbox-listing.png";
import winnerTakesAllImage from "../assets/winner-takes-all-listing.png";


// Shared data structures
export interface HeroContent {
  hero_title_part1: string;
  hero_title_part2: string;
  hero_description: string;
}

export interface ServiceItem {
  icon: React.ComponentType;
  title: string;
  description: string;
  duration?: string;
  bgColor?: string;
  iconBg?: string;
  borderColor?: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  tags: string[];
  bgColor: string;
  path: string;
  image: string | StaticImageData;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ProcessItem {
  icon: number | React.ComponentType;
  title: string;
  weeks: string;
  description: string;
  bgColor?: string;
  iconBg?: string;
}

// Data arrays
export const heroContent: HeroContent = {
  hero_title_part1: 'Light the Way',
  hero_title_part2: 'To Your Next Moonshot',
  hero_description: 'We specialise in design thinking, AI integration, and Web3 to power your next giant leap in digital innovation',
};

export const sprintPackages: ServiceItem[] = [
  {
    icon: Search,
    title: 'Discovery Sprint',
    duration: '1-2 weeks',
    description: 'Validate ideas and define project scope through research and strategic planning',
    borderColor: 'from-cyan-400 to-cyan-600',
    iconBg: 'bg-[#BBFEFF]'
  },
  {
    icon: Rocket,
    title: 'Prototype Sprint',
    duration: '2-4 weeks',
    description: 'Build interactive prototypes and test the experience with target users',
    borderColor: 'from-purple-400 to-purple-600',
    iconBg: 'bg-[#BBFEFF]'
  },
  {
    icon: Target,
    title: 'PoC Sprint',
    duration: '4-8 weeks',
    description: 'Develop a fully functioning proof of concept tested with real users',
    borderColor: 'from-pink-400 to-pink-600',
    iconBg: 'bg-[#BBFEFF]'
  }
];

export const expertiseAreas: ServiceItem[] = [
  {
    icon: TelescopeIcon,
    title: 'Innovation Discovery',
    description: 'Our discovery process cuts through the noise to uncover and adapt to high-impact opportunities, ensuring we\'re solving the right problems from day one.',
    bgColor: 'bg-[#BBFEFF]',
    iconBg: 'bg-[#BBFEFF]'
  },
  {
    icon: PersonStanding,
    title: 'Human-Centric Design',
    description: 'Powerful technology is nothing without a flawless user experience. We help you deliver products that are not only functional but also beautiful, intuitive, and a delight to use.',
    bgColor: 'bg-[#BBFEFF]',
    iconBg: 'bg-[#BBFEFF]'
  },
  {
    icon: BrainIcon,
    title: 'AI Implementations',
    description: 'Seamlessly integrate the power of AI into your workflows. Your unique challenges require a custom-fit solution. We build bespoke intelligent systems to level up your team\'s capabilities - in days, not months.',
    bgColor: 'bg-[#BBFEFF]',
    iconBg: 'bg-[#BBFEFF]'
  },
  {
    icon: NetworkIcon,
    title: 'Web3 & Decentralised Solutions',
    description: 'Build the next generation of the internet. Our experts can guide you through the complexities of blockchain, smart contracts, and tokenisation to create novel, community-owned experiences.',
    bgColor: 'bg-[#BBFEFF]',
    iconBg: 'bg-[#BBFEFF]'
  }
];

export const expertiseSection: ServiceItem[] = [
  {
    icon: UserStar,
    title: 'Design Thinking',
    description: 'Deep empathy and human-centered approach to innovation',
    bgColor: 'bg-[#BBFEFF]',
    iconBg: 'bg-[#BBFEFF]'
  },
  {
    icon: Cpu,
    title: 'Emerging Tech',
    description: 'Our home is the cutting edge. We learn quickly, and powerfully',
    bgColor: 'bg-[#BBFEFF]',
    iconBg: 'bg-[#BBFEFF]'
  },
  {
    icon: Kanban,
    title: 'Agile Methodologies',
    description: 'Fast value, high adaptability, and reduced waste',
    bgColor: 'bg-[#BBFEFF]',
    iconBg: 'bg-[#BBFEFF]'
  },
  {
    icon: Images,
    title: 'UX/UI',
    description: 'Beautiful, intuitive user experiences are at the core of everything we do',
    bgColor: 'bg-[#BBFEFF]',
    iconBg: 'bg-[#BBFEFF]'
  }
];

export const devProcess: ProcessItem[] = [
  {
    icon: 1,
    title: 'FREE Introductory Session',
    weeks: '1 hour',
    description: 'A brief but intensive session to clarify your business goals, define the problem you\'re solving, and align on your next steps.',
    bgColor: 'from-blue-400 to-blue-600',
    iconBg: 'bg-blue-500'
  },
  {
    icon: 2,
    title: 'Discovery Sprint',
    weeks: '1 - 2 weeks',
    description: 'An immersive and collaborative process where our teams ideate solutions and create the blueprint for your prototype.',
    bgColor: 'from-purple-400 to-purple-600',
    iconBg: 'bg-purple-500'
  },
  {
    icon: 3,
    title: 'Prototype Sprint',
    weeks: '2 - 4 weeks',
    description: 'Rapidly develop a clickable prototype that you can use to test your core assumptions with real users and stakeholders.',
    bgColor: 'from-pink-400 to-pink-600',
    iconBg: 'bg-pink-500'
  },
  {
    icon: 4,
    title: 'Build Sprint',
    weeks: '3 - 6 weeks',
    description: 'Build the core functional product, and outline the strategy and timeline of a successful launch.',
    bgColor: 'from-yellow-400 to-orange-500',
    iconBg: 'bg-yellow-500'
  }
];

export const ourServices: ProjectItem[] = [
  {
    title: 'Winner-Takes-All DAO for Community Grants',
    description: 'A decentralised application (dApp) that enables communities to run transparent, competitive funding rounds.',
    tags: ['Web 3.0', 'UI/UX Design'],
    bgColor: 'bg-indigo-700',
    path: '/case-studies/winner-takes-all-dao',
    image: winnerTakesAllImage
  },
  {
    title: 'Stacks\' First Curated Multimedia NFT Collection',
    description: 'Launching the network\'s first music, generative, and mixed-media collections.',
    tags: ['AI Integration', 'Design thinking'],
    bgColor: 'bg-emerald-700',
    path: '/case-studies/stacks-nft-collection',
    image: nftCollectionImage
  },
  {
    title: 'Pizza Hut: Checkout Redesign',
    description: 'Expert guidance to navigate complex technical challenges.',
    tags: ['Tech Stack Audit', 'Scalability', 'Security'],
    bgColor: 'bg-rose-700',
    path: '/case-studies/pizza-hut-redesign',
    image: pizzaHutImage
  },
  {
    title: 'ToucanBox: Redesigning Sign-Up for Busy Parents',
    description: 'How a user-centric overhaul reduced friction and boosted subscriber conversion.',
    tags: ['Bug Fixing', 'Updates', 'Performance Monitoring'],
    bgColor: 'bg-cyan-700',
    path: '/case-studies/toucanbox-sign-up',
    image: toucanBoxImage
  },
  {
    title: 'AI Agent Portfolio Builder',
    description: 'Slashing onboarding friction with AI-powered data sourcing.',
    tags: ['Bug Fixing', 'Updates', 'Performance Monitoring'],
    bgColor: 'bg-orange-700',
    path: '/case-studies/auto-portfolio-builder',
    image: aiAgentImage
  },
  {
    title: 'AI WhatsApp Assistant',
    description: 'Automated assistant for managing bookings and answering questions 24/7.',
    tags: ['Bug Fixing', 'Updates', 'Performance Monitoring'],
    bgColor: 'bg-pink-700',
    path: '/case-studies/ai-whatsapp-assistant',
    image: aiWhatsAppImage
  },
];

export const faqData: FAQItem[] = [
  {
    question: 'I\'ve already completed part of this process - can you just help me with a specific section?',
    answer: 'Modularity is at the heart of our process. Our kickoff meeting will assess the stage you are currently at, and discover where you want to be. We will always tailor our services to provide help only in the necessary and relevant areas that add maximum value, and avoid retreading old ground.',
  },
  {
    question: 'How much is it going to cost?',
    answer: 'Project costs vary based on the scope, duration, and team required. A one-week Discovery Sprint has a different cost than a multi-week full process prototype & build engagement. We provide a detailed, fixed-price proposal after the initial session so there are no surprises.',
  },
  {
    question: 'Who from my team needs to be involved in a Sprint?',
    answer: 'Our philosophy is simple; you are the experts in your business, we are the experts in the process.\nYou will provide the primary decision-maker. Beyond that, we encourage you to bring relevant team members to participate in the process alongside us. Your team\'s deep knowledge can be invaluable fuel for the sprint, and allow you to more effectively take the process forward after we finish working together.',
  },
];

export const imageTextContent = {
  title: "Clarity in Days, Confidence for Years",
  subtitle: "Intensive design sprints to turn vision into reality.",
  description: "We don't just innovate for you, we equip you with the tools to do so yourself. By the end of our process, you will have more than just a product; you'll have a unified team, a validated concept, and a clear strategic plan to take your moonshot idea to market."
};

export const processSectionTitle = "The Framework for Your Next Breakthrough";
