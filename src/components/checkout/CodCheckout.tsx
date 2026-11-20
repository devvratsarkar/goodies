"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CheckoutAlert from "@/components/checkout/CheckoutAlert";
import { type PaymentMethod } from "@/components/checkout/PaymentMethods";
import { useCheckoutTotalsUpdating } from "@/components/checkout/useCheckoutTotalsUpdating";
import { usePlaceWhenSignedIn } from "@/components/checkout/usePlaceWhenSignedIn";
import { PlacedOrder } from "@/server/types/order";
import { usePlaceOrderMutation } from "@/store/endpoints/orderApi";
import { readDeviceType } from "@/utils/deviceId";
import { readOrigin } from "@/utils/origin";

type CodCheckoutProps = {
  billingAddressId: string | null;
  shippingAddressId: string | null;
  country: string;
  shippingAvailable: boolean;
  onPlaced: (order: PlacedOrder) => void;
  buttonClassName?: string;
  /** null reuses the page cart. Omitted watches cash on delivery. */
  totalsMethod?: PaymentMethod | null;
};

export default function CodCheckout({ billingAddressId, shippingAddressId, country, shippingAvailable, onPlaced, buttonClassName, totalsMethod }: CodCheckoutProps) {
  const t = useTranslations("CheckoutClassicPage");
  const totalsUpdating = useCheckoutTotalsUpdating(totalsMethod === null ? undefined : totalsMethod ?? "cod");
  const [error, setError] = useState("");
  const [placeOrder, { isLoading }] = usePlaceOrderMutation();

  async function placeCodOrder() {
    if (!billingAddressId || !shippingAddressId) return;
    setError("");

    try {
      const order = await placeOrder({
        payment_method: "cod",
        payment_method_title: "Cash on delivery",
        shipping_address_id: shippingAddressId,
        billing_address_id: billingAddressId,
        customer_note: "",
        country,
        payment_status: "pending",
        origin: readOrigin(),
        device_type: readDeviceType(),
      }).unwrap();
      onPlaced(order);
    } catch (error) {
      const message = (error as { data?: { message?: string } })?.data?.message;
      setError(message || t("placeOrderError"));
    }
  }

  const ready = Boolean(shippingAvailable && billingAddressId && shippingAddressId && !totalsUpdating);
  const requestPlace = usePlaceWhenSignedIn(placeCodOrder, ready);

  return (
    <>
      {error ? <CheckoutAlert message={error} className={buttonClassName ? "" : "mt-4"} /> : null}
      <button
        type="button"
        onClick={requestPlace}
        disabled={!shippingAvailable || !billingAddressId || !shippingAddressId || isLoading || totalsUpdating}
        className={
          buttonClassName ??
          "mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70"
        }
      >
        {isLoading ? t("placingOrder") : t("placeOrder")}
      </button>
    </>
  );
}
