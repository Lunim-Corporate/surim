"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock } from "lucide-react";
import EventbriteWidget from "./EventbriteWidget";
import { PrismicRichText } from "@prismicio/react";
import type { RichTextField } from "@prismicio/types";
import { JsonLd } from "./JsonLd";
import type { Event as SchemaEvent, WithContext } from "schema-dts";

const DEFAULT_EVENT_ID =
  process.env.NEXT_PUBLIC_EVENTBRITE_EVENT_ID ?? "1967972076457";
interface EventbriteCourseInfo {
  id: string;
  name: string;
  summary?: string | null;
  startLocal?: string | null;
  endLocal?: string | null;
  timezone?: string | null;
  venueLine?: string | null;
  url?: string | null;
  priceDisplay?: string | null;
}

type FetchState = "idle" | "loading" | "ready" | "error";

const formatDate = (
  value?: string | null,
  options?: Intl.DateTimeFormatOptions
) => {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", options).format(new Date(value));
  } catch {
    return null;
  }
};

const getScheduleMeta = (
  start?: string | null,
  end?: string | null,
  timezone?: string | null
) => {
  const safeTimezone = timezone ?? "UTC";
  if (!start) {
    return {
      dateRange: "Live cohort",
      startDateLabel: null,
      startTimeLabel: null,
      endDateLabel: null,
      endTimeLabel: null,
      timezoneLabel: safeTimezone,
    };
  }

  try {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;
    const rangeFormatter = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const dayFormatter = new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const timeFormatter = new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: safeTimezone,
    });

    const dateRange = endDate
      ? `${rangeFormatter.format(startDate)} → ${rangeFormatter.format(endDate)}`
      : rangeFormatter.format(startDate);

    return {
      dateRange,
      startDateLabel: dayFormatter.format(startDate),
      startTimeLabel: `${timeFormatter.format(startDate)} ${safeTimezone}`,
      endDateLabel: endDate ? dayFormatter.format(endDate) : null,
      endTimeLabel: endDate
        ? `${timeFormatter.format(endDate)} ${safeTimezone}`
        : null,
      timezoneLabel: safeTimezone,
    };
  } catch {
    return {
      dateRange: "Live cohort",
      startDateLabel: null,
      startTimeLabel: null,
      endDateLabel: null,
      endTimeLabel: null,
      timezoneLabel: safeTimezone,
    };
  }
};

const buildFallbackCourse = (eventId: string): EventbriteCourseInfo => {
  const safeId = eventId || DEFAULT_EVENT_ID;
  return {
    id: safeId,
    name: "AI First Marketing Academy",
    startLocal: null,
    endLocal: null,
    timezone: "UTC",
    priceDisplay: "TBD",
    url: `https://www.eventbrite.co.uk/e/${safeId}`,
  };
};

const toIsoString = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
};

interface EventbriteSectionProps {
  className?: string;
  eventId?: string;
  title?: string;
  description?: string | null;
  descriptionRichText?: RichTextField | null;
  locationOverride?: string | null;
}

const EventbriteSection: React.FC<EventbriteSectionProps> = ({
  className = "",
  eventId,
  title,
  description,
  descriptionRichText,
  locationOverride,
}) => {
  const safeEventId = eventId?.trim() || DEFAULT_EVENT_ID;
  const fallbackCourse = useMemo(
    () => buildFallbackCourse(safeEventId),
    [safeEventId]
  );
  const [courseInfo, setCourseInfo] =
    useState<EventbriteCourseInfo>(fallbackCourse);
  const [status, setStatus] = useState<FetchState>("idle");

  useEffect(() => {
    setCourseInfo(fallbackCourse);
    setStatus("idle");
  }, [fallbackCourse]);

  useEffect(() => {
    let ignore = false;
    if (!safeEventId) return;

    const fetchCourse = async () => {
      setStatus("loading");
      try {
        const response = await fetch(
          `/api/eventbrite/course?eventId=${safeEventId}`
        );
        const payload = (await response.json()) as {
          success?: boolean;
          data?: EventbriteCourseInfo;
          message?: string;
        };

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.message || "Failed to load Eventbrite data.");
        }

        if (!ignore) {
          setCourseInfo(payload.data);
          setStatus("ready");
        }
      } catch (error) {
        console.error("Eventbrite course fetch failed", error);
        if (!ignore) {
          setStatus("error");
        }
      }
    };

    fetchCourse();

    return () => {
      ignore = true;
    };
  }, [safeEventId]);

  const scheduleMeta = useMemo(
    () =>
      getScheduleMeta(
        courseInfo?.startLocal,
        courseInfo?.endLocal,
        courseInfo?.timezone
      ),
    [courseInfo]
  );
  const cohortDate =
    formatDate(courseInfo?.startLocal, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) ?? "TBA";
  const investment = courseInfo?.priceDisplay ?? "Request quote";
  const locationText =
    locationOverride?.trim() || courseInfo?.venueLine || "Online via Zoom";
  const effectiveEventId = courseInfo?.id || safeEventId;
  const heading = title?.trim() || courseInfo?.name || "";
  const supportingCopy = description?.trim() || courseInfo?.summary || null;
  const hasRichDescription =
    Array.isArray(descriptionRichText) && descriptionRichText.length > 0;
  const canonicalEventUrl =
    courseInfo?.url || `https://www.eventbrite.com/e/${effectiveEventId}`;
  const startDateIso = toIsoString(courseInfo?.startLocal);
  const priceDisplay = courseInfo?.priceDisplay?.trim() || null;

  const eventJsonLd = useMemo<WithContext<SchemaEvent> | null>(() => {
    if (!heading) return null;
    const place = {
      "@type": "Place" as const,
      name: locationText,
      address: {
        "@type": "PostalAddress" as const,
        addressLocality: locationText,
      },
    };
    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: heading,
      ...(supportingCopy ? { description: supportingCopy } : {}),
      startDate: startDateIso ?? "Please insert valid ISO 8601 date/time here. Examples: 2015-07-27 or 2015-07-27T15:30",
      url: canonicalEventUrl,
      location: place,
      organizer: {
        "@type": "Organization",
        name: "Surim",
        url: "https://surim.io",
      },
      ...(priceDisplay
        ? {
            offers: {
              "@type": "Offer" as const,
              price: priceDisplay,
            },
          }
        : {}),
    };
  }, [canonicalEventUrl, heading, locationText, startDateIso, supportingCopy, priceDisplay]);

  return (
    <div
      id="book-event"
      className={`bg-[#0f172a] border border-white/20 rounded-3xl p-8 md:p-10 shadow-[0_24px_65px_rgba(0,0,0,0.45)] space-y-8 ${className}`}
    >
      {eventJsonLd ? <JsonLd data={eventJsonLd} /> : null}
      <div className="text-center space-y-3">
        <h3 className="text-white text-3xl md:text-4xl font-semibold tracking-tight">
          {heading}
        </h3>
        {hasRichDescription ? (
          <div className="text-base text-gray-300 max-w-3xl mx-auto prose prose-invert prose-p:text-gray-300 prose-strong:text-white prose-a:text-[#BBFEFF]">
            <PrismicRichText
              field={descriptionRichText ?? []}
              components={{
                paragraph: ({ children }) => <p>{children}</p>,
              }}
            />
          </div>
        ) : supportingCopy ? (
          <p className="text-base text-gray-300 max-w-3xl mx-auto">
            {supportingCopy}
          </p>
        ) : null}
        {status === "loading" && (
          <p className="text-sm text-cyan-200">Updating Eventbrite details…</p>
        )}
        {status === "error" && (
          <p className="text-sm text-rose-300">
            Unable to sync Eventbrite right now. Showing saved details.
          </p>
        )}
      </div>

      <dl className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-5">
        <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-white/0 p-6 space-y-5 text-center flex flex-col justify-center h-full">
          <dt className="text-sm uppercase tracking-[0.3em] text-white/50">
            Schedule
          </dt>
          <dd className="space-y-4 text-white flex flex-col">
            {scheduleMeta.startDateLabel ? (
              <div className="rounded-2xl bg-white/5 px-5 py-4 flex-1 flex flex-col justify-between">
                <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                      Start
                    </p>
                    <p className="text-xl font-semibold text-white">
                      {scheduleMeta.startDateLabel}
                    </p>
                    <p className="text-base text-white/70">
                      {scheduleMeta.startTimeLabel}
                    </p>
                  </div>
                  <span className="text-white/40 text-2xl">→</span>
                  <div className="flex-1 text-center sm:text-right">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                      End
                    </p>
                    <p className="text-xl font-semibold text-white">
                      {scheduleMeta.endDateLabel ?? "TBA"}
                    </p>
                    {scheduleMeta.endTimeLabel && (
                      <p className="text-base text-white/70">
                        {scheduleMeta.endTimeLabel}
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-xs text-center uppercase tracking-[0.4em] text-white/40">
                  {`Timezone · ${scheduleMeta.timezoneLabel}`}
                </p>
              </div>
            ) : (
              <p className="text-sm text-white/60 flex-1 flex items-center justify-center">
                New schedule coming soon.
              </p>
            )}
            <p className="text-sm text-white/60 mt-4">
              Next cohort: <span className="text-white">{cohortDate}</span>
            </p>
          </dd>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-3xl border border-white/15 bg-white/5 p-6 text-center flex-1 flex flex-col justify-center">
            <dt className="text-sm uppercase tracking-[0.3em] text-white/50">
              Investment
            </dt>
            <dd className="mt-4 text-white text-4xl font-semibold">
              {investment}
            </dd>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/5 p-6 text-center flex-1 flex flex-col justify-center">
            <dt className="text-sm uppercase tracking-[0.3em] text-white/50">
              Location
            </dt>
            <dd className="mt-4 text-white text-3xl font-semibold">
              {locationText}
            </dd>
          </div>
        </div>
      </dl>

      <div className="space-y-3">
        <EventbriteWidget
          eventId={effectiveEventId}
          buttonLabel="Book Course"
          eventUrl={courseInfo?.url}
        />
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
          <Lock className="h-4 w-4 text-[#BBFEFF]" />
          <span>Powered by Eventbrite · Secure checkout</span>
        </div>
      </div>
    </div>
  );
};

export default EventbriteSection;
