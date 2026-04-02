import React from 'react';
import { PrismicRichText } from '@prismicio/react';
import type { SliceComponentProps } from '@prismicio/react';
import type { Content } from '@prismicio/client';
import { asText } from '@prismicio/helpers';

// Import the icons 
import {
  UserStar,
  PersonStanding,
  Cpu,
  Kanban,
  Images,
  Network,
  FileText,
  Coins,
  LockKeyhole,
  Route,
  Mouse,
  BookOpen,
  Stamp,
  CircleUserRound,
  HelpCircle,
  Blocks,
  Glasses,
  Frame,
  Sun,
  type LucideProps,
} from 'lucide-react';

// Map the text from Prismic to the actual icon components
const iconComponents: { [key: string]: React.ComponentType<LucideProps> } = {
  UserStar: UserStar,
  PersonStanding: PersonStanding,
  Cpu: Cpu,
  Kanban: Kanban,
  Network: Network,
  FileText: FileText,
  Coins: Coins,
  LockKeyhole: LockKeyhole,
  Route: Route,
  BookOpen: BookOpen,
  Stamp: Stamp,
  CircleUserRound: CircleUserRound,
  Images: Images,
  Frame: Frame,
  Mouse: Mouse,
  Blocks: Blocks,
  Glasses: Glasses,
  Sun: Sun,
};

type ServiceGridSectionProps = SliceComponentProps<Content.ServiceGridSlice>;

const ServiceGridSection: React.FC<ServiceGridSectionProps> = ({ slice }) => {
  const columns = slice.primary.columns || 4;
  const gridClass = `grid grid-cols-1 sm:grid-cols-2 ${columns === 4 ? 'md:grid-cols-4' : ''} gap-10`;
  const items = (slice.items as any[]) ?? [];
  
  return (
    // Use the section_id directly from the Key Text field
    <section id={slice.primary.section_id || undefined} className="py-16 bg-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-3xl font-bold text-white mb-12">
            <PrismicRichText field={slice.primary.title} />
        </div>
        <div className={gridClass}>
          {items.map((item: any, index: number) => {
            const Icon = iconComponents[item.icon_name || ''] || HelpCircle;
            
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: item.icon_background_color || '#BBFEFF' }}
                >
                  <Icon className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-[#BBFEFF] font-semibold text-lg mb-1">
                    {asText(item.item_title)}
                </h3>
                <div className="text-gray-200 text-base max-w-xs">
                    <PrismicRichText field={item.item_description} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceGridSection;
