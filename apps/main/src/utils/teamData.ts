import type { StaticImageData } from "next/image";
import peterPonton from "../assets/Peter-headshot.png";
import peteFrancomb from "../assets/pete-headshot.png";
import nickCurum from "../assets/nick-headshot.png";

export interface SocialLink {
  icon: string;
  url: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string | StaticImageData;
  bio: string;
  details: string[];
  social: SocialLink[];
}
export const team: TeamMember[] = [
  {
    name: "Peter Ponton",
    role: "Chief Executive: Operations",
    image: peterPonton,
    bio: "Peter brings over 30 years of high-tech leadership, with extensive expertise in launching and transforming businesses within the digital landscape.",
    details: [
      "As CEO of Risidio, he pioneers sustainable applications using blockchain and NFT technology.",
      "His work empowers creative and indigenous communities, aiming to build a more equitable and decentralised digital future.",
      "His innovative approach drives the mission to turn today's moonshots into tomorrow's realities."
    ],
    social: [
      { icon: "linkedin", url: "#" },
      { icon: "twitter", url: "#" }
    ]
  },
  {
    name: "Pete Francomb",
    role: "Chief Executive: Creative",
    image: peteFrancomb,
    bio: "Pete is a visionary entrepreneur dedicated to building sustainable ventures where commercial success and human flourishing converge.",
    details: [
      "Co-founder of Tabb, the UK's largest network of independent filmmakers, and Altt Productions, a data-driven film studio.",
      "Has consistently pushed boundaries within creative industries.",
      "His deep understanding of user experience and agile methodologies are key to crafting human-centric solutions."
    ],
    social: [
      { icon: "linkedin", url: "#" },
      { icon: "twitter", url: "#" }
    ]
  },
  {
    name: "Nick Curum",
    role: "Chief Operating Officer (COO)",
    image: nickCurum,
    bio: "A seasoned energy executive with over two decades of global experience, Nick is dedicated to advancing the energy sector through practical AI and intelligent workflows.",
    details: [
      "Founder of The AI Energy Think Tank, advising industry leaders on modernising operations.",
      "Vocal advocate for the professionals driving a more sustainable energy future."
    ],
    social: [
      { icon: "linkedin", url: "#" },
      { icon: "twitter", url: "#" }
    ]
  }
];
