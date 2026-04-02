"use client";
import { FC } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { asText } from "@prismicio/helpers";
import type { Content } from "@prismicio/client";
import EventbriteSection from "@/components/EventbriteSection";
type EventbriteProps = SliceComponentProps<Content.EventbriteSlice>;
const Eventbrite: FC<EventbriteProps> = ({ slice }) => {
  const heading = asText(slice.primary.heading) || null;
  const description = asText(slice.primary.description) || null;
  const eventId = slice.primary.eventbrite_event_id || "";
  const locationOverride = slice.primary.location_override || null;
  return (
    <section className="bg-[#0f172a] px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <EventbriteSection
          eventId={eventId}
          title={heading}
          description={description}
          descriptionRichText={slice.primary.description}
          locationOverride={locationOverride}
        />
      </div>
    </section>
  );
};
export default Eventbrite;
