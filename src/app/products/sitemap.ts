import type { MetadataRoute } from "next";
import { api } from "@/server/api";
import type { ProductListItem } from "@/server/types/products";
import { routing } from "@/i18n/routing";
import { defaultCurrency } from "@/utils/currency";
import { getProductRoutePath } from "@/utils/routes";
import { canonicalPath } from "@/utils/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchProducts(): Promise<ProductListItem[]> {
  try {
    const { data } = await api.get("/user/products", {
      headers: {
        country: defaultCurrency,
        "Cache-Control": "no-store",
      },
    });
    return (data?.data as ProductListItem[] | null) ?? [];
  } catch (error) {
    console.error(
      "products sitemap: product list unavailable",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/+$/, "");
  const products = await fetchProducts();

  return products
    .filter((item) => item.slug)
    .flatMap((item) =>
      routing.locales.map((locale) => ({
        url: `${baseUrl}${canonicalPath(locale, getProductRoutePath(item.slug))}`,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
    );
}
