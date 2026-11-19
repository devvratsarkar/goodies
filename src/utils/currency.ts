export const currencies = ["AED", "USD", "EUR", "SAR", "QAR", "KWD", "OMR", "BHD"] as const;

export type CurrencyCode = (typeof currencies)[number];

export const defaultCurrency: CurrencyCode = "AED";

export const tabbyCurrencies = ["AED", "SAR", "KWD"] as const satisfies readonly CurrencyCode[];
export const tamaraCurrencies = ["AED", "SAR", "BHD", "KWD", "OMR"] as const satisfies readonly CurrencyCode[];

export function offersTabby(currency: CurrencyCode) {
  return (tabbyCurrencies as readonly CurrencyCode[]).includes(currency);
}

export function offersTamara(currency: CurrencyCode) {
  return (tamaraCurrencies as readonly CurrencyCode[]).includes(currency);
}

export const countryCookie = "country";

export function toCurrency(value: string | undefined | null): CurrencyCode {
  return value && (currencies as readonly string[]).includes(value) ? (value as CurrencyCode) : defaultCurrency;
}
