import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ImageComponent from "@/components/layout/common/ImageComponent";
import type { ReactNode } from "react";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductPrice from "@/components/product/ProductPrice";
import { getProductRoutePath } from "@/utils/routes";
import { HomeProduct } from "@/server/types/Home";


export default function ProductCard({
  product,
  variant_sku,
  savedSize,
  savedPrice,
  wishlistAction,
}: {
  product: HomeProduct;
  variant_sku?: string;
  savedSize?: string;
  savedPrice?: { price: number; maxPrice: number };
  wishlistAction?: ReactNode;
}) {
  const t = useTranslations("ProductCard");
  const name = product?.title ?? "";
  const isBundle = product?.product_type === "bundle";
  const isVariant = Boolean(product?.is_variant) || isBundle;
  const isNew = product?.new_product;
  const variant = savedPrice
    ? { sku: variant_sku ?? "", stock: 0, price: savedPrice.price, max_price: savedPrice.maxPrice }
    : product?.variant;
  const variants = savedPrice ? [variant] : (product?.variants ?? []);
  const outOfStock = product.stock_manage && product.stock_status === "out_of_stock"; // when stock_manage is false, the product is always in stock
  const size = savedSize?.trim() ?? "";


  const payload = {
    product_id: product._id,
    quantity: 1,
    variant_sku: variant_sku ?? "",
  };

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-background sm:rounded-2xl">
      {wishlistAction}
      <Link
        href={getProductRoutePath(product.slug)}
        className="flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <div className="relative aspect-square overflow-hidden bg-surface">
          <ImageComponent
            src={product?.thumbnail ?? "/images/image-fallback.svg"}
            alt={name}
            width={800}
            height={800}
            objectFit="cover"
            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 22vw"
          // className="p-3 sm:p-4"
          />

          {isNew ? (
            <span className="absolute inset-s-2.5 top-2.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground sm:inset-s-3 sm:top-3">
              {t("new")}
            </span>
          ) : null}

          {outOfStock ? (
            <span className="absolute inset-x-0 bottom-0 bg-primary py-1.5 text-center text-xs font-semibold text-white">
              {t("outOfStock")}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col px-3 pt-2.5 sm:px-4 sm:pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
            {product?.categoryId?.name ?? ""}
          </p>
          <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-snug text-heading sm:min-h-11 sm:text-[15px]">
            {name}
          </h3>
          {size ? <p className="mt-1 text-xs text-muted">{t("size", { value: size })}</p> : null}
          <ProductPrice
            variant={variant}
            variants={variants.filter((item) => item != null)}
            isVariant={Boolean(savedPrice) || Boolean(product?.is_variant)}
            hideMaxPrice={isBundle}
            currencySymbol={product.pricing_context?.currency_symbol}
          />
        </div>
      </Link>
      <div className="px-3 pt-3 pb-3 sm:px-4 sm:pb-4">
        {outOfStock ? (
          <p aria-hidden className="inline-flex h-11 w-full items-center justify-center rounded-full border border-primary bg-surface px-3 text-sm font-medium text-primary">
            {t("outOfStock")}
          </p>
        ) : isVariant ? (
          <Link
            href={getProductRoutePath(product.slug)}
            className="inline-flex h-11 w-full min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("selectOption")}
          </Link>
        ) : (
          <AddToCartButton variant="product" payload={payload} />
        )}
      </div>
    </article>
  );
}
