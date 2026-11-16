"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";

export function PushPermissionPrompt() {
  useEffect(() => {
    function onAsk() {
      const currentToken = Cookies.get("token");
      if (!currentToken) return;

      void import("@/utils/webPush")
        .then(async (push) => {
          const publicKey = await push.readVapidPublicKey();
          await push.enablePushNotifications(publicKey, currentToken);
          window.dispatchEvent(new Event("goodies-push-changed"));
        })
        .catch(() => {
          // The browser prompt was dismissed or the public key could not be loaded.
        });
    }

    window.addEventListener("goodies-push-ask", onAsk);
    return () => window.removeEventListener("goodies-push-ask", onAsk);
  }, []);

  return null;
}
