import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { countryCookie, currencies, toCurrency } from "./utils/currency";

const handleI18n = createMiddleware(routing);
const currencyCodes: readonly string[] = currencies;

function withoutCurrency(pathname: string) {
  const trailing = pathname.length > 1 && pathname.endsWith("/");
  const parts = pathname.split("/").filter(Boolean);
  const currencyAt = routing.locales.includes(parts[0] as (typeof routing.locales)[number]) ? 1 : 0;
  const code = parts[currencyAt];
  if (!code || !currencyCodes.includes(code)) return null;
  parts.splice(currencyAt, 1);
  if (parts[0] === routing.defaultLocale) parts.shift();
  const next = parts.length ? `/${parts.join("/")}` : "/";
  return {
    pathname: trailing && next !== "/" ? `${next}/` : next,
    currency: toCurrency(code),
  };
}

export default function proxy(request: NextRequest) {
  const currencyPath = withoutCurrency(request.nextUrl.pathname);
  if (currencyPath) {
    const url = request.nextUrl.clone();
    url.pathname = currencyPath.pathname;
    const response = NextResponse.redirect(url, 307);
    response.cookies.set(countryCookie, currencyPath.currency, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: url.protocol === "https:",
    });
    return response;
  }

  return handleI18n(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
