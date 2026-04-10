export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

type GtagParams = Record<string, string | number | boolean | undefined>;
type GtagFunction = (...args: unknown[]) => void;

interface WindowWithGtag extends Window {
  dataLayer?: unknown[];
  gtag?: GtagFunction;
}

const DEFAULT_MEASUREMENT_ID = GA_ID;
const GTAG_BASE_URL = "https://www.googletagmanager.com/gtag/js";

const getWindow = (): WindowWithGtag | null =>
  typeof window === "undefined" ? null : (window as WindowWithGtag);

const isBrowser = () =>
  typeof window !== "undefined" && typeof document !== "undefined";

const ensureDataLayer = (win: WindowWithGtag) => {
  if (!win.dataLayer) {
    win.dataLayer = [];
  }
  return win.dataLayer;
};

const ensureGtag = (win: WindowWithGtag) => {
  if (!win.gtag) {
    const dataLayer = ensureDataLayer(win);
    win.gtag = function gtag(...args: unknown[]) {
      dataLayer.push(args);
    };
  }
  return win.gtag;
};

const resolveMeasurementId = (measurementId?: string) =>
  measurementId || DEFAULT_MEASUREMENT_ID;

const hasActiveGtag = () => {
  const win = getWindow();
  return Boolean(resolveMeasurementId() && win?.gtag);
};

export const initGA = (measurementId?: string) => {
  if (!isBrowser()) return;

  const id = resolveMeasurementId(measurementId);
  if (!id) return;

  const win = getWindow();
  if (!win) return;

  const scriptSrc = `${GTAG_BASE_URL}?id=${id}`;
  if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
    const gtagScript = document.createElement("script");
    gtagScript.async = true;
    gtagScript.src = scriptSrc;
    document.head.appendChild(gtagScript);
  }

  const gtag = ensureGtag(win);
  gtag("js", new Date());
  gtag("config", id, {
    page_title:
      typeof document !== "undefined" ? document.title : undefined,
    page_location: win.location?.href,
  });
};

export const trackPageView = (
  url: string,
  title?: string,
  measurementId?: string
) => {
  const id = resolveMeasurementId(measurementId);
  if (!id) return;

  const win = getWindow();
  const gtag = win?.gtag;
  if (!gtag) return;

  const params: GtagParams = {
    page_path: url,
    page_location: win.location?.href || url,
  };

  const resolvedTitle =
    title ||
    (typeof document !== "undefined" ? document.title : undefined);
  if (resolvedTitle) {
    params.page_title = resolvedTitle;
  }

  gtag("config", id, params);
};

export const pageview = (url: string, title?: string) =>
  trackPageView(url, title);

export const trackEvent = (
  eventName: string,
  parameters: GtagParams = {},
  measurementId?: string
) => {
  const id = resolveMeasurementId(measurementId);
  if (!id) return;

  const win = getWindow();
  const gtag = win?.gtag;
  if (!gtag) return;

  const payload: GtagParams = {
    event_category: "engagement",
    ...parameters,
  };

  gtag("event", eventName, payload);
};

export const event = (action: string, params: GtagParams = {}) =>
  trackEvent(action, params);

export const trackFormSubmission = (
  formName: string,
  success: boolean = true
) =>
  trackEvent("form_submit", {
    event_category: "form",
    event_label: formName,
    value: success ? 1 : 0,
    success,
  });

export const trackButtonClick = (buttonName: string, section?: string) =>
  trackEvent("click", {
    event_category: "button",
    event_label: buttonName,
    section: section || "unknown",
  });

export const trackNavigation = (linkName: string, destination: string) =>
  trackEvent("navigate", {
    event_category: "navigation",
    event_label: linkName,
    destination,
  });

export const trackScrollDepth = (percentage: number) =>
  trackEvent("scroll", {
    event_category: "engagement",
    event_label: "scroll_depth",
    value: percentage,
  });

export const trackDownload = (fileName: string, fileType: string) =>
  trackEvent("file_download", {
    event_category: "download",
    event_label: fileName,
    file_type: fileType,
  });

export const trackVideoInteraction = (
  videoTitle: string,
  action: string,
  progress?: number
) =>
  trackEvent(`video_${action}`, {
    event_category: "video",
    event_label: videoTitle,
    value: typeof progress === "number" ? progress : undefined,
  });

export const trackSearch = (searchTerm: string, resultsCount?: number) =>
  trackEvent("search", {
    event_category: "search",
    search_term: searchTerm,
    results_count: resultsCount,
  });

export const trackContactForm = (
  action: string,
  formType: string = "contact"
) =>
  trackEvent(`contact_form_${action}`, {
    event_category: "contact",
    event_label: formType,
    form_type: formType,
  });

export const isGAReady = () => hasActiveGtag();

export {};
