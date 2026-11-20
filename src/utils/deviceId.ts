const storageKey = "goodies-device-id";

export type DeviceType = "mobile" | "tablet" | "desktop";

export function readDeviceType(): DeviceType {
  if (typeof navigator === "undefined") return "desktop";
  const agent = navigator.userAgent;
  const iPad = /iPad/i.test(agent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (iPad || /Tablet|PlayBook|Silk/i.test(agent) || (/Android/i.test(agent) && !/Mobile/i.test(agent))) return "tablet";
  if (/Mobi|iPhone|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(agent)) return "mobile";
  return "desktop";
}

export function getDeviceId() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing) {
      return existing;
    }

    const id = crypto.randomUUID();
    window.localStorage.setItem(storageKey, id);
    return id;
  } catch {
    return null;
  }
}
