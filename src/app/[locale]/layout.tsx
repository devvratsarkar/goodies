import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_Arabic } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PushPermissionPrompt } from "@/components/account/PushPermissionPrompt";
import { AuthProvider } from "@/components/auth/AuthProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartDrawerProvider } from "@/components/cart/CartDrawerProvider";
import { BottomNav } from "@/components/layout/footer/BottomNav";
import Footer from "@/components/layout/footer/Footer";
import { ModalProvider } from "@/components/layout/common/ModalProvider";
import { ScrollToTopButton } from "@/components/layout/common/ScrollToTopButton";
import { WhatsAppFloatingButton } from "@/components/layout/common/WhatsAppFloatingButton";
import { Header } from "@/components/layout/header/Header";
import MobileViewportFix from "@/components/layout/MobileViewportFix";
import { OriginCookie } from "@/components/layout/OriginCookie";
import { TrackingScripts } from "@/components/layout/TrackingScripts";
import { StoreProvider } from "@/store/StoreProvider";
import { routing } from "@/i18n/routing";
import { getCategories, getGlobalSettings } from "@/server";
import { getRequestCurrency } from "@/server/currency";
import { getProductCategoryRoutePath } from "@/utils/routes";
import "../../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export const revalidate = 600;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d60751",
  viewportFit: "cover",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const settings = await getGlobalSettings(await getRequestCurrency());
  const brand = settings?.platformName?.trim() || t("title");
  const keywords = settings?.meta_keywords?.trim();
  const googleVerification = settings?.search_console?.trim();
  const metaVerification = settings?.meta_domain_verification?.trim();

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    applicationName: brand,
    title: brand,
    keywords: keywords || undefined,
    category: "shopping",
    verification: {
      ...(googleVerification ? { google: googleVerification } : {}),
      ...(metaVerification ? { other: { "facebook-domain-verification": metaVerification } } : {}),
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: brand,
    },
    other: {
      "apple-mobile-web-app-capable": "yes",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const country = await getRequestCurrency();
  const [settings, categories] = await Promise.all([
    getGlobalSettings(country),
    getCategories(country),
  ]);
  const schemaMarkup = settings?.schema_markup?.trim();
  const shopCategories = (categories ?? []).map((category) => ({
    href: getProductCategoryRoutePath(category.slug),
    label: category.name,
  }));
  const phone = settings?.phone?.trim() || "";
  const whatsapp = settings?.whatsapp_number?.trim() || "";
  const contact = {
    email: settings?.email?.trim() || "",
    phone,
    address: settings?.address?.trim() || "",
    instagram: settings?.instagram_link?.trim() || "",
    whatsapp: whatsapp ? `https://wa.me/${whatsapp}` : "",
    youtube: settings?.youtube_link?.trim() || "",
    x: settings?.x_link?.trim() || "",
    linkdin: settings?.linkdin_link?.trim() || "",
    facebook: settings?.facebook_link?.trim() || "",
  };
  const jsonLd = schemaMarkup && /^[\[{]/.test(schemaMarkup) ? schemaMarkup : "";

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${geistSans.variable} ${locale === "ar" ? notoArabic.variable : ""} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <MobileViewportFix />
        {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} /> : null}
        <OriginCookie />
        <TrackingScripts
          googleAnalyticsId={settings?.google_analytics_id}
          googleTagManagerId={settings?.google_tag_manager}
          clarityId={settings?.microsoft_clarity}
          metaPixelId={settings?.meta_pixel}
          tiktokPixelId={settings?.tiktok_pixel}
          snapPixelId={settings?.snap_pixel}
        />
        <NextIntlClientProvider>
          <StoreProvider>
            <AuthProvider>
              <PushPermissionPrompt />
              <ModalProvider>
                <CartDrawerProvider>
                  <div className="flex min-h-full flex-1 flex-col">
                    <Header
                      logo={settings?.logo || ""}
                      currency={country}
                      headerTextFirst={settings?.header_text_first?.trim() || ""}
                      headerTextSecond={settings?.header_text_second?.trim() || ""}
                    />
                    <main className="flex-1">{children}</main>
                    <Footer
                      logo={settings?.logo || ""}
                      description={settings?.platformDescription?.trim() || ""}
                      categories={shopCategories}
                      contact={contact}
                      country={country}
                    />
                    <BottomNav />
                    <WhatsAppFloatingButton href={contact.whatsapp} />
                    <ScrollToTopButton />
                  </div>
                  <CartDrawer />
                </CartDrawerProvider>
              </ModalProvider>
            </AuthProvider>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
