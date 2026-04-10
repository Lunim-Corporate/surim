"use client";
import Avatar from "boring-avatars";
// React
import { FC, useState, useEffect, useMemo } from "react";
// Prismic
import type { Content } from "@prismicio/client";
import { asText } from "@prismicio/helpers";
import { SliceComponentProps } from "@prismicio/react";
// Next
import Image from "next/image";
import { JsonLd } from "@/components/JsonLd";
import type { ItemList, ListItem, Person, WithContext } from "schema-dts";


/**
 * Props for `OurTeam`.
 */
export type OurTeamProps = SliceComponentProps<Content.OurTeamSlice>;

/**
 * Component for "OurTeam" Slices.
 */
const OurTeam: FC<OurTeamProps> = ({ slice }) => {
  const [active, setActive] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const members = useMemo(() => (slice.primary.team_member as any[]) ?? [], [slice.primary.team_member]);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
          ScrollTrigger.normalizeScroll(true);
        });
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, [isMobile]);

  const teamJsonLd = useMemo<WithContext<ItemList> | null>(() => {
    if (!members.length) return null;
    const itemListElement: ListItem[] = [];
    members.forEach((member: any, index: number) => {
      const name = asText(member?.name);
      if (!name) {
        return;
      }
      const person: Person = {
        "@type": "Person",
        name,
        ...(member?.role ? { jobTitle: member.role } : {}),
        ...(member?.description ? { description: member.description } : {}),
        ...(member?.headshot?.url ? { image: member.headshot.url } : {}),
      };
      itemListElement.push({
        "@type": "ListItem",
        position: index + 1,
        item: person,
      });
    });

    if (!itemListElement.length) return null;

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement,
    };
  }, [members]);

  return (
    <>
      {teamJsonLd ? <JsonLd data={teamJsonLd} id="team-schema" /> : null}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200">
        <div className="w-full max-w-6xl px-4 mx-auto py-16">
        <div className="mb-12 mt-12 text-center">
        {/* Start header */}
        <header className="text-center mb-12 px-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            {asText(slice.primary.title)}
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            {slice.primary.description}
          </p>
        </header>
        {/* End header */}

        {/* Team Section */}
        <section className="max-w-6xl mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member: any, i: number) => {
              const memberName = asText(member?.name);
              return (
                <div
                  key={i}
                  className={`transition duration-300 ${
                    active && active !== memberName && !isMobile
                      ? "blur-sm opacity-70"
                      : ""
                  }`}
                  >
                  <TeamMember
                    member={member}
                    isActive={active === memberName}
                    setActive={setActive}
                    isMobile={isMobile}
                  />
                </div>
              )
          })}
          </div>
        </section>
        {/* End Team Section */}
        </div>
        </div>
      </div>
    </>
  );
};

export default OurTeam;

/**
 * Team Member Component
 */
const TeamMember: FC<{
  member: any;
  isActive: boolean;
  setActive: (name: string | null) => void;
  isMobile: boolean;
}> = ({ member, isActive, setActive, isMobile }) => {
  const [imageError, setImageError] = useState(false);
  const memberName = asText(member?.name);
   // Fallback image if `member.headshot.url` is null or undefined
  const imageUrl = member?.headshot?.url || "/placeholder-image.png";

  return (
    <div
      className={`relative rounded-xl shadow-xl overflow-hidden transition-all duration-500 h-full
        ${isActive && !isMobile ? "z-10 scale-[1.02]" : "hover:scale-[1.01]"} 
        ${!isActive && !isMobile ? "hover:z-5" : ""}`}
      onMouseEnter={() => !isMobile && setActive(memberName)}
      onMouseLeave={() => !isMobile && setActive(null)}
    >
      {/* Background Image */}
      <div className="h-80 sm:h-96 relative">
        {imageError ? (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Avatar
              size={300}
              name={memberName || "Unknown"} 
              variant="beam"
              colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
            />
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={asText(member?.name) || "Team Member"}
            className="w-full h-full object-cover"
            fill
            onError={() => setImageError(true)}
          />
        )}

        {/* Overlay with Name */}
        <div
          className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 
          transition-all duration-500 ease-in-out opacity-100 translate-y-0 block`}
        >
          <h3 className="text-lg font-semibold text-white text-left">{memberName}</h3>
        </div>
      </div>
      {/* Expandable Bio Section */}
      {/* <BioCard member={member} isMobile={isMobile} /> */}
      <BioCard member={member} />
    </div>
  );
};

/**
 * Bio Card Component
 */
// const BioCard: FC<{
//   member: Content.OurTeamSliceDefaultPrimaryTeamMemberItem;
//   isMobile: boolean;
// }> = ({ member, isMobile }) => {
const BioCard: FC<{
  member: any;
}> = ({ member }) => {
  return (
    // <div
    //   className={`transition-all duration-500 ease-in-out overflow-hidden bg-slate-900/90 
    //     rounded-b-xl shadow-lg max-h-[500px] opacity-100 p-5
    //     ${isMobile ? "!max-h-[500px] !opacity-100 !p-5" : ""}`}
    // >
    <div
      className={`bg-slate-900/90 p-5 text-start h-full`}
    >
      <div className="mb-4">
        <span className="text-sm text-slate-400">{member?.role}</span>
      </div>

      <div className="text-slate-200 text-sm py-2">
        {/* Keeps the formatting the same as it is in Prismic */}
        <p className="whitespace-pre-wrap">{member?.description}</p>
      </div>
    </div>
  );
};
