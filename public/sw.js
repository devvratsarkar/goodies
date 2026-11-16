self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const payload = readPayload(event);
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: payload.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = sameOriginUrl(event.notification.data && event.notification.data.url);
  event.waitUntil(openTarget(target));
});

function readPayload(event) {
  const fallback = { title: "Goodies", body: "", url: "/" };
  if (!event.data) return fallback;

  try {
    const data = event.data.json();
    const notification = data.notification && typeof data.notification === "object" ? data.notification : {};
    const extra = data.data && typeof data.data === "object" ? data.data : {};
    return {
      title: firstString(data.title, notification.title, fallback.title),
      body: firstString(data.body, notification.body, data.message, ""),
      url: firstString(data.url, extra.url, data.link, notification.click_action, "/"),
    };
  } catch {
    return { ...fallback, body: event.data.text() };
  }
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function sameOriginUrl(value) {
  try {
    const url = new URL(value || "/", self.location.origin);
    if (url.origin !== self.location.origin) return `${self.location.origin}/`;
    return url.href;
  } catch {
    return `${self.location.origin}/`;
  }
}

async function openTarget(target) {
  const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  const existing = windows.find((client) => "focus" in client);
  if (existing) {
    if ("navigate" in existing) {
      try {
        await existing.navigate(target);
      } catch {
        // The open page can still be focused when navigation is refused.
      }
    }
    return existing.focus();
  }
  if (self.clients.openWindow) return self.clients.openWindow(target);
}
