"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { disablePushNotifications, readPushEnabled } from "@/utils/webPush";

export function PushNotificationCard() {
  const t = useTranslations("AccountPage");
  const { token } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const subscribed = await readPushEnabled();
      if (!cancelled) setEnabled(subscribed);
    }

    void load();

    function onChange() {
      void load();
    }

    window.addEventListener("goodies-push-changed", onChange);
    return () => {
      cancelled = true;
      window.removeEventListener("goodies-push-changed", onChange);
    };
  }, []);

  async function turnOff() {
    if (!token || busy) return;
    setBusy(true);
    setError(false);
    try {
      await disablePushNotifications(token);
      setEnabled(false);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  if (!enabled) return null;

  return (
    <section className="rounded-2xl border border-border bg-background px-5 py-4">
      <h2 className="text-lg font-bold text-heading">{t("notifications")}</h2>
      <p className="mt-1 text-sm text-muted">{t("notificationsIntro")}</p>
      <p className="mt-3 text-sm text-heading" aria-live="polite">
        {error ? t("notificationsError") : t("notificationsOn")}
      </p>
      <button
        type="button"
        onClick={turnOff}
        disabled={busy || !token}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? t("notificationsWorking") : t("notificationsDisable")}
      </button>
    </section>
  );
}
