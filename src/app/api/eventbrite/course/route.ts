"use server";

import { NextResponse } from "next/server";

const EVENTBRITE_API_BASE = "https://www.eventbriteapi.com/v3";
const DEFAULT_EVENT_ID =
  process.env.EVENTBRITE_EVENT_ID ?? process.env.NEXT_PUBLIC_EVENTBRITE_EVENT_ID;

interface EventbriteEvent {
  id: string;
  name?: { text?: string | null } | null;
  summary?: string | null;
  description?: { text?: string | null } | null;
  url?: string | null;
  start?: { local?: string | null; timezone?: string | null } | null;
  end?: { local?: string | null; timezone?: string | null } | null;
  venue?: {
    name?: string | null;
    address?: {
      address_1?: string | null;
      city?: string | null;
      region?: string | null;
      country?: string | null;
    } | null;
  } | null;
  logo?: { url?: string | null } | null;
  is_free?: boolean | null;
  status?: string | null;
}

interface MoneyAmount {
  display?: string;
  currency?: string;
  value?: number;
}

interface TicketClass {
  id: string;
  name?: string;
  cost?: MoneyAmount | null;
  cost_with_fee?: MoneyAmount | null;
  actual_cost?: MoneyAmount | null;
  fee?: MoneyAmount | null;
  free?: boolean;
  on_sale_status?: string;
}

interface TicketClassesResponse {
  ticket_classes?: TicketClass[];
}

const extractTicketDisplay = (ticket: TicketClass) =>
  ticket.cost_with_fee?.display ??
  ticket.actual_cost?.display ??
  ticket.cost?.display ??
  null;

const extractTicketValue = (ticket: TicketClass) =>
  ticket.cost_with_fee?.value ??
  ticket.actual_cost?.value ??
  ticket.cost?.value ??
  Number.MAX_SAFE_INTEGER;

const formatPriceDisplay = (tickets: TicketClassesResponse | null, isFree?: boolean | null) => {
  if (isFree) return "Free";
  const paidTickets =
    tickets?.ticket_classes?.filter((ticket) => !!extractTicketDisplay(ticket)) ??
    [];
  if (!paidTickets.length) return null;

  const sortedByValue = [...paidTickets].sort(
    (a, b) => extractTicketValue(a) - extractTicketValue(b)
  );

  return extractTicketDisplay(sortedByValue[0]) ?? null;
};

const buildVenueLine = (event: EventbriteEvent) => {
  const parts = [
    event.venue?.name,
    event.venue?.address?.address_1,
    event.venue?.address?.city,
    event.venue?.address?.region,
    event.venue?.address?.country,
  ].filter(Boolean);

  return parts.join(", ");
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchEventId = url.searchParams.get("eventId") ?? undefined;
  const eventId = searchEventId || DEFAULT_EVENT_ID || "1967972076457";

  if (!eventId) {
    return NextResponse.json(
      { success: false, message: "Missing Eventbrite event ID." },
      { status: 400 }
    );
  }

  const token = process.env.EVENTBRITE_OAUTH_TOKEN;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Eventbrite API token is not configured. Add EVENTBRITE_OAUTH_TOKEN to the environment.",
      },
      { status: 500 }
    );
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const eventResponse = await fetch(
      `${EVENTBRITE_API_BASE}/events/${eventId}/?expand=venue`,
      {
        headers,
        cache: "no-store",
      }
    );

    if (!eventResponse.ok) {
      const errorText = await eventResponse.text();
      return NextResponse.json(
        { success: false, message: `Eventbrite error: ${errorText}` },
        { status: eventResponse.status }
      );
    }

    const eventData = (await eventResponse.json()) as EventbriteEvent;

    let ticketData: TicketClassesResponse | null = null;
    try {
      const ticketResponse = await fetch(
        `${EVENTBRITE_API_BASE}/events/${eventId}/ticket_classes/`,
        {
          headers,
          cache: "no-store",
        }
      );
      if (ticketResponse.ok) {
        ticketData = (await ticketResponse.json()) as TicketClassesResponse;
      }
    } catch (ticketError) {
      console.error(ticketError);
      console.error("Unable to fetch Eventbrite ticket classes", ticketError);
    }

    const normalized = {
      id: eventData.id,
      name: eventData.name?.text ?? "AI First Marketing Academy",
      summary: eventData.summary ?? eventData.description?.text ?? null,
      startLocal: eventData.start?.local ?? null,
      endLocal: eventData.end?.local ?? null,
      timezone: eventData.start?.timezone ?? eventData.end?.timezone ?? null,
      venueLine: buildVenueLine(eventData),
      url: eventData.url ?? null,
      imageUrl: eventData.logo?.url ?? null,
      isFree: !!eventData.is_free,
      status: eventData.status ?? null,
      priceDisplay: formatPriceDisplay(ticketData, eventData.is_free),
    };

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error(error);
    console.error("Eventbrite API request failed", error);
    return NextResponse.json(
      { success: false, message: "Failed to load Eventbrite data." },
      { status: 500 }
    );
  }
}
