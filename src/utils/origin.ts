import sbjs from "sourcebuster";

let initialized = false;

export function rememberOrigin() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;
  sbjs.init({
    lifetime:        6,
    session_length:  30,
    timezone_offset: "0",
    base64:          false,
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
