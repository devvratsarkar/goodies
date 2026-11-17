// Public widget key from the live Goodies storefront. It only renders Tamara's promo.
const TAMARA_PUBLIC_KEY = "f26cc29a-ec69-48d8-97e7-ca43e8e9cbe0";
const TAMARA_WIDGET_SCRIPT = "https://cdn.tamara.co/widget-v2/tamara-widget.js";

function tamaraLang(locale: string) {
  return locale === "ar" ? "ar" : "en";
}

function setTamaraConfig(lang: string) {
  window.tamaraWidgetConfig = {
    lang,
    country: "AE",
    publicKey: TAMARA_PUBLIC_KEY,
  };
}

function loadTamaraWidget() {
  if (window.TamaraWidgetV2) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${TAMARA_WIDGET_SCRIPT}"]`);
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      if (window.TamaraWidgetV2) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Tamara widget failed to load")), { once: true });
    });
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TAMARA_WIDGET_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Tamara widget failed to load"));
    document.head.appendChild(script);
  });
}

function plansTrigger() {
  let host = document.querySelector<HTMLElement>("tamara-widget[data-goodies-plans]");
  if (!host) {
    host = document.createElement("tamara-widget");
    host.setAttribute("data-goodies-plans", "");
    host.setAttribute("type", "tamara-summary");
    host.setAttribute("inline-type", "2");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = "position:fixed;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap";
    document.body.appendChild(host);
  }
  return host;
}

function waitForPlansLink(host: HTMLElement) {
  return new Promise<HTMLElement | null>((resolve) => {
    let settled = false;
    let shadowObserver: MutationObserver | null = null;
    const attributes = new MutationObserver(() => watch());
    const finish = (link: HTMLElement | null) => {
      if (settled) return;
      settled = true;
      shadowObserver?.disconnect();
      attributes.disconnect();
      resolve(link);
    };
    const ready = () => {
      const link = host.shadowRoot?.querySelector<HTMLElement>(".tamara-inline-learn-more-link");
      if (!link) return;
      finish(link);
    };
    function watch() {
      if (!host.shadowRoot || shadowObserver) return;
      shadowObserver = new MutationObserver(ready);
      shadowObserver.observe(host.shadowRoot, { childList: true, subtree: true });
      ready();
    }
    watch();
    attributes.observe(host, { attributes: true });
    window.setTimeout(() => finish(host.shadowRoot?.querySelector<HTMLElement>(".tamara-inline-learn-more-link") ?? null), 5000);
  });
}

/** Opens Tamara's own product-plan popup for one amount. The script loads on click. */
export function openTamaraProductPlans(price: number, locale: string) {
  const lang = tamaraLang(locale);
  const amount = price.toFixed(2);
  setTamaraConfig(lang);
  return loadTamaraWidget().then(() => {
    setTamaraConfig(lang);
    const host = plansTrigger();
    host.setAttribute("amount", amount);
    host.shadowRoot?.querySelector(".tamara-inline-learn-more-link")?.remove();
    window.TamaraWidgetV2?.refresh();
    return waitForPlansLink(host).then((link) => link?.click());
  });
}
