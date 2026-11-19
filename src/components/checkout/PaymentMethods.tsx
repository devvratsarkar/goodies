"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useModal } from "@/components/layout/common/ModalProvider";
import { TabbyInstallmentFrame } from "@/components/product/TabbyInstallmentFrame";
import { openTamaraProductPlans } from "@/components/product/TamaraPromo";
import { useGetCartQuery } from "@/store/endpoints/cartApi";
import { offersTabby, offersTamara, toCurrency } from "@/utils/currency";
import { formatAmount } from "@/utils/price";

export type PaymentMethod = "cod" | "tabby" | "ziina" | "tamara";

export type EnabledGateways = {
  tabby: boolean;
  tamara: boolean;
  ziina: boolean;
};

export function resolveDefaultPaymentMethod(value: string | null | undefined, enabled: EnabledGateways): PaymentMethod | null {
  const method = value?.trim().toLowerCase();
  if (method === "cod") return "cod";
  if ((method === "tabby" || method === "ziina" || method === "tamara") && enabled[method]) return method;
  return null;
}

type PaymentMethodsProps = {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
  variant?: "default" | "sheet";
  /** Settings default — shown as a badge, not auto-selected. */
  primaryMethod?: string | null;
  enabled: EnabledGateways;
  disabled?: boolean;
};

export default function PaymentMethods({ value, onChange, variant = "default", primaryMethod = null, enabled, disabled = false }: PaymentMethodsProps) {
  const t = useTranslations("CheckoutClassicPage");
  const locale = useLocale();
  const { openModal } = useModal();
  // The default method reuses the page cart. Another method needs its own totals.
  const cartMethod = primaryMethod == null ? (value ?? undefined) : !value || value === primaryMethod ? undefined : value;
  const { data: cart } = useGetCartQuery(cartMethod);
  const cod = cart?.summary?.cod_status ? cart.cod_method : null;
  const currencyRef = useRef<ReturnType<typeof toCurrency> | null>(null);
  if (cart?.summary?.currency) currencyRef.current = toCurrency(cart.summary.currency);
  const currency = currencyRef.current;
  const methods = (["cod", "ziina", "tabby", "tamara"] as const).filter((method) => {
    if (method === "cod") return Boolean(cod);
    if (!enabled[method]) return false;
    if (method === "ziina") return true;
    if (!currency) return false;
    if (method === "tabby") return offersTabby(currency);
    return offersTamara(currency);
  });
  const sheet = variant === "sheet";
  const price = cart?.summary?.total_amount ?? 0;
  const monthly = formatAmount(Math.round((price / 4) * 100) / 100, cart?.summary?.currency_symbol ?? "");

  useEffect(() => {
    if (!currency || !value || methods.includes(value)) return;
    const primary = primaryMethod?.trim().toLowerCase();
    const fallback = methods.find((method) => method === primary) ?? methods.find((method) => method === "ziina") ?? methods[0];
    if (fallback) onChange(fallback);
  }, [currency, value, methods, onChange, primaryMethod]);

  function openInstallments(event: MouseEvent<HTMLButtonElement>, method: "tabby" | "tamara") {
    event.preventDefault();
    event.stopPropagation();
    if (method === "tabby") {
      openModal({
        title: t("payTabby"),
        size: "md",
        content: <TabbyInstallmentFrame price={price} currency={currency ?? "AED"} title={t("payTabby")} />,
      });
      return;
    }
    void openTamaraProductPlans(price, locale).catch(() => undefined);
  }

  return (
    <div className={sheet ? "grid gap-3" : "mt-6 border-t border-border pt-5"}>
      {sheet ? null : <h2 className="text-base font-bold">{t("paymentMethod")}</h2>}
      <div className={sheet ? "grid gap-3" : "mt-4 grid gap-3"} role="radiogroup" aria-label={t("paymentMethod")} aria-disabled={disabled || undefined}>
        {methods.map((method) => {
          const selected = value === method;
          const isPrimary = primaryMethod === method;
          const title = method === "ziina" ? t("payZiina") : method === "tabby" ? t("payTabby") : method === "tamara" ? t("payTamara") : t("payCod");
          const note = method === "ziina" ? t("payZiinaNote") : method === "tabby" ? t("payTabbyNote") : method === "tamara" ? t("payTamaraNote") : null;

          return (
            <label
              key={method}
              className={`flex items-start gap-3 rounded-xl border ${sheet ? "p-3.5" : "p-4"} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${selected ? "border-primary bg-primary-soft" : "border-border"}`}
            >
              <input
                type="radio"
                name={sheet ? "checkout-auth-payment-method" : "payment-method"}
                value={method}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(method)}
                className="mt-1 size-4 accent-primary disabled:cursor-not-allowed"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-heading">{title}</span>
                    {isPrimary ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">{t("primaryMethod")}</span>
                    ) : null}
                  </span>
                  {method === "cod" && cod ? (
                    <span className="shrink-0 text-end text-sm font-bold tabular-nums text-price">
                      {cod.is_free ? t("free") : t("codExtra", { amount: formatAmount(cod.charge, cart?.summary?.currency_symbol ?? "") })}
                    </span>
                  ) : null}
                  {method === "tabby" ? (
                    <span className="shrink-0 rounded-md bg-[#3cff7e] px-2 py-1 text-sm font-black tracking-tight text-black lowercase">tabby</span>
                  ) : null}
                  {method === "ziina" ? (
                    <span className="shrink-0 rounded-md bg-black px-2 py-1 text-sm font-black tracking-tight text-white lowercase">ziina</span>
                  ) : null}
                  {method === "tamara" ? (
                    <span className="shrink-0 rounded-md bg-linear-to-r from-[#ff8a00] via-[#ff4d8d] to-[#7c3aed] px-2 py-1 text-sm font-bold text-white">tamara</span>
                  ) : null}
                </span>
                {note ? <span className="mt-1 block text-sm text-muted">{note}</span> : null}
                {method === "tabby" || method === "tamara" ? (
                  <span className="mt-1 flex items-center justify-between gap-2 text-start">
                    <button
                      type="button"
                      onClick={(event) => openInstallments(event, method)}
                      className="min-w-0 flex-1 text-start text-sm font-semibold text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {method === "tabby"
                        ? t.rich("tabbyLearnMore", {
                            amount: monthly,
                            price: (chunks) => (
                              <bdi dir="ltr" className="whitespace-nowrap">
                                {chunks}
                              </bdi>
                            ),
                          })
                        : t("tamaraLearnMore")}
                    </button>
                    <button
                      type="button"
                      onClick={(event) => openInstallments(event, method)}
                      className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {t("viewOptions")}
                    </button>
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
