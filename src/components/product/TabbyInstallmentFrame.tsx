"use client";

import { useLocale } from "next-intl";
import { tabbyCurrencies } from "@/utils/currency";

export function TabbyInstallmentFrame({ price, currency, title }: { price: number; currency: string; title: string }) {
  const locale = useLocale();
  const lang = locale === "ar" ? "ar" : "en";
  const code = (tabbyCurrencies as readonly string[]).includes(currency) ? currency : "AED";
  const src = `https://checkout.tabby.ai/promos/product-page/installments/${lang}/?price=${price}&currency=${code}`;

  return (
    <div className="-mx-5 -mb-5 border-t border-border bg-[#f4f3f0]">
      <iframe src={src} title={title} className="block h-[min(75dvh,680px)] w-full border-0" />
    </div>
  );
}
