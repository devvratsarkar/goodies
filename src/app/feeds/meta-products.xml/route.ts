import { api } from "@/server/api";
import type {
  FacebookCatalogData,
  FacebookCatalogProduct,
} from "@/server/types/facebookCatalog";
import { defaultCurrency } from "@/utils/currency";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const REQUIRED_TAGS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "link",
  "image_link",
  "brand",
] as const;

/** API keys → RSS g: tag local name (brackets become underscores for valid XML). */
const FIELD_TAGS: { key: keyof FacebookCatalogProduct; tag: string }[] = [
  { key: "id", tag: "id" },
  { key: "title", tag: "title" },
  { key: "description", tag: "description" },
  { key: "availability", tag: "availability" },
  { key: "condition", tag: "condition" },
  { key: "link", tag: "link" },
  { key: "image_link", tag: "image_link" },
  { key: "brand", tag: "brand" },
  { key: "price", tag: "price" },
  { key: "google_product_category", tag: "google_product_category" },
  { key: "fb_product_category", tag: "fb_product_category" },
  { key: "quantity_to_sell_on_facebook", tag: "quantity_to_sell_on_facebook" },
  { key: "sale_price", tag: "sale_price" },
  { key: "sale_price_effective_date", tag: "sale_price_effective_date" },
  { key: "item_group_id", tag: "item_group_id" },
  { key: "gender", tag: "gender" },
  { key: "color", tag: "color" },
  { key: "size", tag: "size" },
  { key: "age_group", tag: "age_group" },
  { key: "material", tag: "material" },
  { key: "pattern", tag: "pattern" },
  { key: "shipping", tag: "shipping" },
  { key: "shipping_weight", tag: "shipping_weight" },
  { key: "offer_disclaimer", tag: "offer_disclaimer" },
  { key: "offer_disclaimer_url", tag: "offer_disclaimer_url" },
  { key: "video[0].url", tag: "video_url" },
  { key: "video[0].tag[0]", tag: "video_tag" },
  { key: "gtin", tag: "gtin" },
  { key: "product_tags[0]", tag: "product_tag_0" },
  { key: "product_tags[1]", tag: "product_tag_1" },
  { key: "style[0]", tag: "style" },
];

function siteBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/+$/, "");
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function isEmpty(value: string | undefined | null) {
  const trimmed = value?.trim();
  return !trimmed || trimmed.toUpperCase() === "N/A";
}

function fieldValue(
  product: FacebookCatalogProduct,
  key: keyof FacebookCatalogProduct,
): string | null {
  const raw = product[key];
  if (typeof raw !== "string") return null;

  if (!isEmpty(raw)) return raw.trim();

  // Required-field fallbacks so Meta can still parse the item.
  if (key === "condition") return "new";
  if (key === "brand") return "Goodies";
  if (key === "description") {
    return isEmpty(product.title) ? "Product" : product.title.trim();
  }

  if ((REQUIRED_TAGS as readonly string[]).includes(key)) {
    return raw?.trim() || "";
  }

  return null;
}

function itemXml(product: FacebookCatalogProduct) {
  const lines = FIELD_TAGS.flatMap(({ key, tag }) => {
    const value = fieldValue(product, key);
    if (value == null) return [];
    return [`      <g:${tag}>${escapeXml(value)}</g:${tag}>`];
  });

  return `    <item>\n${lines.join("\n")}\n    </item>`;
}

async function fetchCatalogProducts(): Promise<FacebookCatalogProduct[]> {
  try {
    const { data } = await api.get("/user/facebook-catalog", {
      headers: {
        country: defaultCurrency,
        "Cache-Control": "no-store",
      },
    });
    const catalog = data?.data as FacebookCatalogData | null | undefined;
    return catalog?.products ?? [];
  } catch (error) {
    console.error(
      "meta-products feed: facebook-catalog unavailable",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export async function GET() {
  const baseUrl = siteBaseUrl();
  const products = await fetchCatalogProducts();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Goodies Facebook Catalog</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Facebook Commerce Manager product feed</description>
${products.map(itemXml).join("\n")}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
