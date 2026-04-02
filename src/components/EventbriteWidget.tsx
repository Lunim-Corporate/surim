"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    EBWidgets?: {
      createWidget: (options: {
        widgetType: string;
        eventId: string;
        modal?: boolean;
        modalTriggerElementId: string;
        onOrderComplete?: () => void;
      }) => void;
    };
  }
}

const EVENTBRITE_SCRIPT_ID = "eventbrite-widget-script";
const EVENTBRITE_WIDGET_SRC =
  "https://www.eventbrite.com/static/widgets/eb_widgets.js";

const loadEventbriteScript = () =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return;
    const existingScript = document.getElementById(
      EVENTBRITE_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", (error) => reject(error));
      return;
    }

    const script = document.createElement("script");
    script.id = EVENTBRITE_SCRIPT_ID;
    script.src = EVENTBRITE_WIDGET_SRC;
    script.async = true;
    script.dataset.loaded = "false";

    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = (error) => reject(error);

    document.body.appendChild(script);
  });

interface EventbriteWidgetProps {
  eventId: string;
  buttonLabel?: string;
  eventUrl?: string | null;
}

export const EventbriteWidget: React.FC<EventbriteWidgetProps> = ({
  eventId,
  buttonLabel = "Buy Tickets",
  eventUrl,
}) => {
  const [isSecureContext, setIsSecureContext] = useState(true);
  const scrollLockFrameRef = useRef<number | null>(null);
  const scrollLockTimeoutRef = useRef<number | null>(null);
  const buttonId = useMemo(
    () => `eventbrite-widget-modal-trigger-${eventId}`,
    [eventId]
  );

  const stopScrollMaintenance = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (scrollLockFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollLockFrameRef.current);
      scrollLockFrameRef.current = null;
    }

    if (scrollLockTimeoutRef.current !== null) {
      window.clearTimeout(scrollLockTimeoutRef.current);
      scrollLockTimeoutRef.current = null;
    }
  }, []);

  const maintainScrollPosition = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const preservedScrollY = window.scrollY;
    const preservedScrollX = window.scrollX;

    stopScrollMaintenance();

    const enforcePosition = () => {
      window.scrollTo({
        top: preservedScrollY,
        left: preservedScrollX,
      });
      scrollLockFrameRef.current =
        window.requestAnimationFrame(enforcePosition);
    };

    enforcePosition();

    scrollLockTimeoutRef.current = window.setTimeout(() => {
      stopScrollMaintenance();
    }, 1200);
  }, [stopScrollMaintenance]);

  useEffect(
    () => () => {
      stopScrollMaintenance();
    },
    [stopScrollMaintenance]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsSecureContext(window.location.protocol === "https:");
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!eventId || !isSecureContext) return;

    const initialiseWidget = async () => {
      try {
        await loadEventbriteScript();
        if (cancelled || typeof window === "undefined") return;
        window.EBWidgets?.createWidget({
          widgetType: "checkout",
          eventId,
          modal: true,
          modalTriggerElementId: buttonId,
          onOrderComplete: () => {
            console.log("Eventbrite order complete");
          },
        });
      } catch (error) {
        console.error("Failed to load Eventbrite widget", error);
      }
    };

    initialiseWidget();

    return () => {
      cancelled = true;
    };
  }, [eventId, buttonId, isSecureContext]);

  const handleButtonClick = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Only apply the scroll lock on larger (desktop-ish) viewports.
    // On small/mobile viewports this was causing the page to jump to the top
    // when opening the Eventbrite checkout.
    if (window.innerWidth >= 768) {
      maintainScrollPosition();
    } else {
      stopScrollMaintenance();
    }
  }, [maintainScrollPosition, stopScrollMaintenance]);

  if (!eventId) {
    return (
      <p className="text-center text-sm text-red-300">
        Event ID missing – please configure NEXT_PUBLIC_EVENTBRITE_EVENT_ID.
      </p>
    );
  }

  if (!isSecureContext) {
    const fallbackUrl =
      eventUrl ?? `https://www.eventbrite.com/e/${eventId}?aff=website_embed`;
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-amber-200">
          Eventbrite checkout needs HTTPS. Open this page over HTTPS or use the
          link below.
        </p>
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full max-w-md justify-center bg-[#BBFEFF] text-black px-8 py-4 rounded-lg font-semibold hover:bg-cyan-300 transition-colors duration-300 shadow-lg no-underline"
        >
          {buttonLabel}
        </a>
      </div>
    );
  }

  return (
    <div className="text-center">
      <button
        id={buttonId}
        type="button"
        className="w-full max-w-md bg-[#BBFEFF] text-black px-8 py-4 rounded-lg font-semibold hover:bg-cyan-300 transition-colors duration-300 shadow-lg cursor-pointer"
        onClick={handleButtonClick}
      >
        {buttonLabel}
      </button>
    </div>
  );
};

export default EventbriteWidget;
