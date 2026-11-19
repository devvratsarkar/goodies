"use client";

import { useTranslations } from "next-intl";
import { TabbyInstallmentFrame } from "@/components/product/TabbyInstallmentFrame";
import { useModal } from "@/components/layout/common/ModalProvider";
import { formatAmount } from "@/utils/price";

type TabbyPromoProps = {
  price: number;
  currency: string;
  currencySymbol: string;
};

export default function TabbyPromo({ price, currency, currencySymbol }: TabbyPromoProps) {
  const t = useTranslations("ProductPage");
  const { openModal } = useModal();

  function openTabbyInfo() {
    openModal({
      title: t("tabbyModalTitle"),
      size: "md",
      content: <TabbyInstallmentFrame price={price} currency={currency} title={t("tabbyModalTitle")} />,
    });
  }

  return (
    <button
      type="button"
      onClick={openTabbyInfo}
      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-border px-3 py-3 text-start text-sm transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4"
    >
      <span className="text-foreground">
        {t("tabbyBefore")} <strong>{formatAmount(price / 4, currencySymbol)} /{t("month")}</strong>{" "}
        {t("tabbyAfter")} <span className="font-semibold text-[#2563eb]">{t("learnMore")}</span>
      </span>
      <span className="shrink-0 rounded-md bg-[#3cff7e] px-2 py-1 text-sm font-black tracking-tight text-black lowercase">
        tabby
      </span>
    </button>
  );
}
