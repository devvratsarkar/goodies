import type { CartApiResponseData } from "@/server/types/cart";
import type { OrderDetails, PlacedOrder } from "@/server/types/order";
import { readCurrencyCookie } from "@/utils/currencyCookie";
import { getDeviceId } from "@/utils/deviceId";

export type MetaStandardEvent =
  | "ViewContent"
  | "Search"
  | "AddToWishlist"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "CompleteRegistration"
  | "Contact";

export type MetaContentItem = {
  id: string;
  quantity?: number;
  item_price?: number;
};

export type MetaEventParams = {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  content_name?: string;
  content_category?: string;
  contents?: MetaContentItem[];
  num_items?: number;
  order_id?: string;
  search_string?: string;
};

export type MetaUserData = {
  email?: string | null;
  phone?: string | null;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function readCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function resolveTestEventCode() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("test_event_code")?.trim();
    if (fromUrl) {
      sessionStorage.setItem("meta_test_event_code", fromUrl);
      return fromUrl;
    }
    return sessionStorage.getItem("meta_test_event_code")?.trim() || undefined;
  } catch {
    return undefined;
  }
}

/** POST Meta-shaped payload to Node: POST /user/meta/events */
function sendToBackendCapi(payload: {
  eventName: MetaStandardEvent;
  eventId: string;
  eventTime: number;
  eventSourceUrl: string;
  params: MetaEventParams;
  fbp?: string;
  fbc?: string;
  email?: string;
  phone?: string;
  testEventCode?: string;
}) {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!base) return;

  const userData: Record<string, unknown> = {};
  if (payload.fbp) userData.fbp = payload.fbp;
  if (payload.fbc) userData.fbc = payload.fbc;
  // Backend should SHA-256 hash em/ph before Meta (API accepts plain values per their contract).
  if (payload.email) userData.em = [payload.email];
  if (payload.phone) userData.ph = [payload.phone.replace(/\D/g, "")];

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: payload.eventName,
        event_time: payload.eventTime,
        event_id: payload.eventId,
        action_source: "website",
        event_source_url: payload.eventSourceUrl,
        user_data: userData,
        custom_data: payload.params,
      },
    ],
  };
  if (payload.testEventCode) body.test_event_code = payload.testEventCode;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    country: readCurrencyCookie(),
  };
  const token = readCookie("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  const deviceId = getDeviceId();
  if (deviceId) headers["device-id"] = deviceId;

  try {
    void fetch(`${base}/user/meta/events`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // Tracking must never break checkout or cart.
  }
}

/** Browser Pixel + backend Conversions API (same event_id for dedupe). */
export function trackMetaEvent(eventName: MetaStandardEvent, params: MetaEventParams = {}, user?: MetaUserData) {
  if (typeof window === "undefined") return;

  const eventId = crypto.randomUUID();
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  ) as MetaEventParams;

  if (typeof window.fbq === "function") {
    window.fbq("track", eventName, cleanParams, { eventID: eventId });
  }

  sendToBackendCapi({
    eventName,
    eventId,
    eventTime: Math.floor(Date.now() / 1000),
    eventSourceUrl: window.location.href,
    params: cleanParams,
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc"),
    email: user?.email?.trim() || undefined,
    phone: user?.phone?.trim() || undefined,
    testEventCode: resolveTestEventCode(),
  });
}

export function metaParamsFromCart(cart: CartApiResponseData | null | undefined): MetaEventParams {
  const items = cart?.items ?? [];
  const summary = cart?.summary;
  if (!summary && items.length === 0) return {};

  return {
    value: summary?.total_amount,
    currency: summary?.currency,
    num_items: summary?.item_count ?? items.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
    content_type: "product",
    content_ids: items.map((item) => item.product_id?._id).filter(Boolean) as string[],
    contents: items
      .filter((item) => item.product_id?._id)
      .map((item) => ({
        id: item.product_id!._id,
        quantity: item.quantity,
        item_price: item.single_price,
      })),
  };
}

export function metaParamsFromOrderDetails(order: OrderDetails): MetaEventParams {
  const items = order.items ?? [];
  const summary = order.summary;
  const contents: MetaContentItem[] = [];
  const contentIds: string[] = [];

  for (const item of items) {
    const id = item.product_id || item.slug || item.item_id;
    if (!id) continue;
    contentIds.push(id);
    contents.push({
      id,
      quantity: item.quantity,
      item_price: item.unit_price,
    });
  }

  return {
    value: summary?.grand_total,
    currency: summary?.currency,
    order_id: order.order_id || String(order.order_number ?? ""),
    num_items: items.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
    content_type: "product",
    content_ids: contentIds,
    contents,
  };
}

export function metaParamsFromPlacedOrder(order: PlacedOrder): MetaEventParams {
  const items = order.order_items ?? [];
  const contents: MetaContentItem[] = [];
  const contentIds: string[] = [];

  for (const item of items) {
    if (!item) continue;
    const id = item.product_id?._id || item.product_id?.slug;
    if (!id) continue;
    contentIds.push(id);
    contents.push({
      id,
      quantity: item.quantity,
      item_price: item.single_price,
    });
  }

  return {
    value: order.total_amount,
    currency: order.currency,
    order_id: order.order_id || String(order.order_number ?? ""),
    num_items: order.item_count ?? items.reduce((sum, item) => sum + (item?.quantity ?? 0), 0),
    content_type: "product",
    content_ids: contentIds,
    contents,
  };
}

export function metaUserFromOrder(order: OrderDetails): MetaUserData {
  const phone =
    order.shipping_address?.phone_number ||
    order.billing_address?.phone_number ||
    null;
  const dial =
    order.shipping_address?.phone_country_code ||
    order.billing_address?.phone_country_code ||
    "";
  const fullPhone = phone ? `${dial}${phone}`.replace(/\D/g, "") : null;

  return {
    email: order.customer_email,
    phone: fullPhone,
  };
}
