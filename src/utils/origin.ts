import sbjs from "sourcebuster";

let initialized = false;

// Map click ID params to utm_source/utm_medium so sbjs records them correctly
const clickIds: Record<string, { source: string; medium: string }> = {
  fbclid:  { source: "facebook",  medium: "cpc" },
  gclid:   { source: "google",    medium: "cpc" },
  wgclid:  { source: "google",    medium: "cpc" },
  ttclid:  { source: "tiktok",    medium: "cpc" },
  msclkid: { source: "bing",      medium: "cpc" },
  sccid:   { source: "snapchat",  medium: "cpc" },
  igshid:  { source: "instagram", medium: "social" },
  ig_mid:  { source: "instagram", medium: "social" },
};

function injectUtmFromClickId() {
  const params = new URLSearchParams(window.location.search);
  for (const [param, mapping] of Object.entries(clickIds)) {
    if (params.has(param)) {
      params.set("utm_source", mapping.source);
      params.set("utm_medium", mapping.medium);
      const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      window.history.replaceState(null, "", newUrl);
      return;
    }
  }
}

export function rememberOrigin() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;
  injectUtmFromClickId();
  sbjs.init({
    lifetime:        6,
    session_length:  30,
    timezone_offset: "0",
    base64:          false,
    ignoredRefs: [
      "ziina.com",
      "pay.ziina.co",
      "tabby.ai",
      "tamara.co",
      "checkout.tabby.ai",
      "checkout.tamara.co",
    ],
  });
}

export function readOrigin(): string {
  if (!sbjs?.get?.current) return "Direct";

  const type = sbjs.get.current.typ;
  const source = sbjs.get.current.src;
  const referrer = sbjs.get.current_add?.rf ?? "(none)";

  if (type === "typein") return "Direct";

  if (type === "organic") return `Organic: ${capitalize(source)}`;

  if (type === "referral") {
    const host = hostName(referrer !== "(none)" ? referrer : source);
    return `Referral: ${capitalize(host)}`;
  }

  // utm
  return `Source: ${capitalize(source)}`;
}

function hostName(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return url;
  }
}

function capitalize(s: string) {
  const v = (s ?? "").replace(/^[()]+|[()]+$/g, "");
  return v.charAt(0).toUpperCase() + v.slice(1);
}
