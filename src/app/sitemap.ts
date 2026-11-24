import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { canonicalPath } from "@/utils/seo";

const staticPaths = [
  "/",
  "/shop",
  "/about-us",
  "/faq",
  "/contact-us",
  "/blogs",
  "/cart",
  "/cart/checkout",
  "/wishlist",
  "/my-account",
  "/my-account/profile",
  "/my-account/address",
  "/my-account/orders",
  "/my-account/coupons",
  "/my-account/reviews",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/+$/, "");

  const pages = staticPaths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${baseUrl}${canonicalPath(locale, path)}`,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
  );

  return [
    ...pages,
    {
      url: `${baseUrl}/products/sitemap.xml`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
  ];
}
