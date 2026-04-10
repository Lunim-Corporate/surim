"use client";
import { FC } from "react";
import type { Content } from "@prismicio/client";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { asText } from "@prismicio/helpers";
import type { LucideProps } from "lucide-react";
import {
  Telescope as TelescopeIcon,
  Brain as BrainIcon,
  Network as NetworkIcon,
  PersonStanding as PersonStandingIcon,
  Pickaxe as PickaxeIcon,
  ClipboardCheck as ClipBoardCheckIcon,
  Workflow as WorkflowIcon,
  GraduationCap as GraduationCapIcon,
  Shirt as ShirtIcon,
  Microscope as MicroscopeIcon,
  SwatchBook as SwatchBookIcon,
  Users as UsersIcon,
  ChartColumnBig as ChartColumnBigIcon,
  BriefcaseBusiness as BriefcaseBusinessIcon,
  ScrollText as ScrollTextIcon,
  Target as TargetIcon,
  ChartLine as ChartLineIcon,
  Bot as BotIcon,
  MessageCircleHeart as MessageCircleHeartIcon,
  Cog as CogIcon,
  Waypoints as WaypointsIcon,
  FileText as FileTextIcon,
  MessagesSquare as MessagesSquareIcon,
  Mail as MailIcon,
  Handshake as HandshakeIcon,
  Coins as CoinsIcon,
  SquareStack as SquareStackIcon,
  Frame as FrameIcon,
  Map as MapIcon,
  Eye as EyeIcon,
  Sunset as SunsetIcon,
  Route as RouteIcon,
  Mouse as MouseIcon,
  Blocks as BlocksIcon,
  Glasses as GlassesIcon,
  HelpCircle,
} from "lucide-react";
import { PrismicNextLink } from "@prismicio/next";

/**
 * Props for `Expertiseareas`.
 */
export type ExpertiseareasProps =
  SliceComponentProps<Content.ExpertiseareasSlice>;

/**
 * Map icon_name (text in Prismic) to Lucide components.
 */
const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Telescope: TelescopeIcon,
  Brain: BrainIcon,
  Network: NetworkIcon,
  PersonStanding: PersonStandingIcon,
  Pickaxe: PickaxeIcon,
  ClipboardCheck: ClipBoardCheckIcon,
  Workflow: WorkflowIcon,
  GraduationCap: GraduationCapIcon,
  Shirt: ShirtIcon,
  Microscope: MicroscopeIcon,
  SwatchBook: SwatchBookIcon,
  Users: UsersIcon,
  ChartColumnBig: ChartColumnBigIcon,
  BriefcaseBusiness: BriefcaseBusinessIcon,
  ScrollText: ScrollTextIcon,
  Target: TargetIcon,
  ChartLine: ChartLineIcon,
  Bot: BotIcon,
  MessageCircleHeart: MessageCircleHeartIcon,
  Cog: CogIcon,
  Waypoints: WaypointsIcon,
  FileText: FileTextIcon,
  MessagesSquare: MessagesSquareIcon,
  Handshake: HandshakeIcon,
  Coins: CoinsIcon,
  SquareStack: SquareStackIcon,
  Frame: FrameIcon,
  Map: MapIcon,
  Eye: EyeIcon,
  Sunset: SunsetIcon,
  Mail: MailIcon,
  Route: RouteIcon,
  Mouse: MouseIcon,
  Blocks: BlocksIcon,
  Glasses: GlassesIcon,
};

const Expertiseareas: FC<ExpertiseareasProps> = ({ slice }) => {
  const isPureCards = slice.variation === "pureCards";

  const items: ReadonlyArray<any> = isPureCards
    ? (((slice.primary as Content.ExpertiseareasSlicePureCardsPrimary).cards ??
        []) as ReadonlyArray<any>)
    : ((slice.items as ReadonlyArray<any>) ?? []);

  // Heading is RichText (heading1). We render as plain text inside our own <h2> to avoid nested heading issues.
  const headingText: string = asText(slice.primary.heading) ?? "";

  const renderCard = (item: any, idx: number) => {
    const Icon = (item.icon_name && ICONS[item.icon_name]) || HelpCircle;
    const itemTitleText: string = asText(item.item_title) ?? "";

    const CardContent = () => (
      <>
        <div className="bg-[#BBFEFF] text-black w-14 h-14 rounded-xl flex items-center justify-center mb-4">
          <Icon className="w-7 h-7" />
        </div>

        {/* Item title rendered as plain text to avoid nested heading conflicts */}
        {itemTitleText && (
          <h3 className="text-xl font-bold text-[#BBFEFF] mb-2">
            {itemTitleText}
          </h3>
        )}

        {/* Description is RichText (paragraph). We control paragraph rendering. */}
        <PrismicRichText
          field={item.item_description}
          components={{
            paragraph: ({ children }) => (
              <p className="text-gray-300 text-base">{children}</p>
            ),
          }}
        />
      </>
    );

    if (item.is_card_link) {
      return (
        <PrismicNextLink
          key={idx}
          field={item.card_link}
          className="transform transition-transform duration-300 hover:scale-105 no-underline"
        >
          <div className="rounded-2xl p-4 md:p-6 bg-black/40 border border-white/16 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:border-[#BBFEFF]/40 transition-colors h-full">
            <CardContent />
            <div>
              <button className="after:content-['_>'] cursor-pointer rounded-[0.3rem] text-[#BBFEFF] text-base hover:text-cyan-300">
                {item.button_text || "More"}
              </button>
            </div>
          </div>
        </PrismicNextLink>
      );
    }

    return (
      <div
        key={idx}
        className="rounded-2xl p-4 md:p-6 bg-black/40 border border-white/16 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] h-full"
      >
        <CardContent />
      </div>
    );
  };

  return (
    <section
      className="py-16 bg-black"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      {isPureCards ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            {headingText && (
              <h2 className="text-4xl font-bold text-white mb-4">
                {headingText}
              </h2>
            )}
            <PrismicRichText
              field={slice.primary.paragraph}
              components={{
                paragraph: ({ children }) => (
                  <p className="text-xl text-gray-300 leading-relaxed">
                    {children}
                  </p>
                ),
              }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map(renderCard)}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          {/* Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 order-2 lg:order-1 gap-8">
            {items.map(renderCard)}
          </div>

          {/* Right column text block */}
          <div className="order-1 lg:order-2">
            {headingText && (
              <h2 className="text-4xl font-bold text-white mb-4">
                {headingText}
              </h2>
            )}

            <PrismicRichText
              field={slice.primary.paragraph}
              components={{
                paragraph: ({ children }) => (
                  <p className="text-xl text-gray-300 leading-relaxed mb-6">
                    {children}
                  </p>
                ),
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Expertiseareas;
