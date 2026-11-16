import { getDeviceId } from "@/utils/deviceId";
import { readCurrencyCookie } from "@/utils/currencyCookie";

const endpointStorageKey = "goodies-push-endpoint";

type PushSubscriptionBody = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export function getPushSupport() {
  if (typeof window === "undefined") return "unsupported" as const;
  if (!window.isSecureContext) return "insecure" as const;

  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
  if (ios && !standalone) return "ios" as const;

  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return "unsupported" as const;
  }

  return "ok" as const;
}

export async function readPushEnabled() {
  const subscription = await currentSubscription();
  return Boolean(subscription);
}

export async function readVapidPublicKey() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/push/vapid-public-key`, {
    headers: { Accept: "application/json" },
  });
  const body = (await response.json().catch(() => null)) as { success?: boolean; message?: string; data?: { publicKey?: string } } | null;
  const publicKey = body?.data?.publicKey;
  if (!response.ok || body?.success === false || !publicKey) {
    throw new Error(body?.message || "Request failed");
  }
  return publicKey;
}

export async function enablePushNotifications(publicKey: string, token: string) {
  if (getPushSupport() !== "ok") throw new Error("unsupported");
  if (!publicKey) throw new Error("unconfigured");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error(permission);

  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));

  await savePushSubscription(token, subscription);
}

export async function disablePushNotifications(token: string) {
  const subscription = await currentSubscription();
  const endpoint = subscription?.endpoint || readStoredEndpoint();
  if (endpoint) await removePushSubscription(token, endpoint);
  if (subscription) await subscription.unsubscribe();
  clearStoredEndpoint();
}

export async function forgetPushSubscription(token: string) {
  try {
    await disablePushNotifications(token);
  } catch {
    const subscription = await currentSubscription();
    await subscription?.unsubscribe().catch(() => undefined);
    clearStoredEndpoint();
  }
}

async function savePushSubscription(token: string, subscription: PushSubscription) {
  const body = toSubscriptionBody(subscription);
  if (!body) throw new Error("invalid");
  await sendSubscription("PUT", token, body);
  writeStoredEndpoint(body.endpoint);
}

async function removePushSubscription(token: string, endpoint: string) {
  await sendSubscription("DELETE", token, { endpoint });
}

async function sendSubscription(
  method: "PUT" | "DELETE",
  token: string,
  body: PushSubscriptionBody | { endpoint: string },
) {
  const deviceId = getDeviceId();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/push-subscription`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      country: readCurrencyCookie(),
      ...(deviceId ? { "device-id": deviceId } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message || "Request failed");
  }
}

async function currentSubscription() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  const registration = await navigator.serviceWorker.getRegistration();
  return registration?.pushManager.getSubscription() ?? null;
}

function toSubscriptionBody(subscription: PushSubscription): PushSubscriptionBody | null {
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!json.endpoint || !p256dh || !auth) return null;
  return { endpoint: json.endpoint, keys: { p256dh, auth } };
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index);
  return bytes;
}

function readStoredEndpoint() {
  try {
    return window.localStorage.getItem(endpointStorageKey);
  } catch {
    return null;
  }
}

function writeStoredEndpoint(endpoint: string) {
  try {
    window.localStorage.setItem(endpointStorageKey, endpoint);
  } catch {
    // A private-mode storage failure still leaves the browser subscription in place.
  }
}

function clearStoredEndpoint() {
  try {
    window.localStorage.removeItem(endpointStorageKey);
  } catch {
    // Ignore private-mode storage failures.
  }
}
