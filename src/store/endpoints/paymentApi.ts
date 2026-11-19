import { TabbySession, TabbySessionPayload, TabbySessionResponse } from "@/server/types/tabby";
import { TamaraCheckout, TamaraCheckoutPayload, TamaraCheckoutResponse } from "@/server/types/tamara";
import { ZiinaCheckout, ZiinaCheckoutPayload, ZiinaCheckoutResponse } from "@/server/types/ziina";
import { readCurrencyCookie } from "@/utils/currencyCookie";
import { api } from "../api";

function aedCheckoutHeader() {
  return readCurrencyCookie() === "AED" ? undefined : { "x-country-override": "AED" };
}

export const paymentApi = api.injectEndpoints({
  endpoints: (build) => ({
    // backend creates the order and the Tabby checkout session, and returns Tabby's payment_url
    createTabbySession: build.mutation<TabbySession, TabbySessionPayload>({
      query: (body) => ({
        url: "/user/tabby/checkout",
        method: "POST",
        body,
        headers: aedCheckoutHeader(),
      }),
      transformResponse: (res: TabbySessionResponse) => res.data,
    }),
    // backend creates the Ziina payment and returns the hosted checkout URL
    createZiinaCheckout: build.mutation<ZiinaCheckout, ZiinaCheckoutPayload>({
      query: (body) => ({
        url: "/user/ziina/checkout",
        method: "POST",
        body,
      }),
      transformResponse: (res: ZiinaCheckoutResponse) => res.data,
    }),
    createTamaraCheckout: build.mutation<TamaraCheckout, TamaraCheckoutPayload>({
      query: (body) => ({
        url: "/user/tamara/checkout",
        method: "POST",
        body,
        headers: aedCheckoutHeader(),
      }),
      transformResponse: (res: TamaraCheckoutResponse) => res.data,
    }),
  }),
});

export const { useCreateTabbySessionMutation, useCreateZiinaCheckoutMutation, useCreateTamaraCheckoutMutation } = paymentApi;
