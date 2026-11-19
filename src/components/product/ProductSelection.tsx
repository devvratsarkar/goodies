"use client";

import { useEffect, useState, type ReactNode } from "react";
import ProductPurchase from "@/components/product/ProductPurchase";
import ProductTabs from "@/components/product/ProductTabs";
import { BundleItemsEntity, ReviewsEntity, SizesEntity, Variant, VariantsEntity } from "@/server/types/singleProduct";

type ProductSelectionProps = {
  notice?: string;
  shortDescription?: string;
  description?: string;
  customNotes?: string;
  children: ReactNode;
  productId: string;
  name: string;
  slug: string;
  isVariant: boolean;
  variant: Variant;
  variants: VariantsEntity[];
  sizes: SizesEntity[];
  currency: string;
  currencySymbol: string;
  weight: number;
  isBundle: boolean;
  bundleItems: BundleItemsEntity[];
  maxSelection: number;
  maxProductQuantity: number;
  bundleStock: number;
  stockManage: boolean;
  stockStatus: "out_of_stock" | "in_stock";
  reviews: ReviewsEntity[];
  averageRating: number;
  totalReviews: number;
};

export default function ProductSelection({
  notice = "",
  shortDescription = "",
  description = "",
  customNotes = "",
  children,
  productId,
  name,
  slug,
  isVariant,
  variant,
  variants,
  sizes,
  currency,
  currencySymbol,
  weight,
  isBundle,
  bundleItems,
  maxSelection,
  maxProductQuantity,
  bundleStock,
  stockManage,
  stockStatus,
  reviews,
  averageRating,
  totalReviews,
}: ProductSelectionProps) {
  const [sizeName, setSizeName] = useState<string | null>(
    () => variants.find((item) => item.is_default)?.size ?? null,
  );

  useEffect(() => {
    if (!isVariant || isBundle) return;
    const sku = new URLSearchParams(window.location.search).get("variant");
    const match = variants.find((item) => item?.sku === sku);
    if (match?.size) setSizeName(match.size);
  }, [isVariant, isBundle, variants]);

  function selectSize(next: string | null) {
    setSizeName(next);
    if (!isVariant || isBundle) return;
    const sku = variants.find((item) => item?.size === next)?.sku;
    const url = new URL(window.location.href);
    if (sku) url.searchParams.set("variant", sku);
    else url.searchParams.delete("variant");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }
  const [picked, setPicked] = useState<Record<string, number>>({});
  const selectedVariant = variants.find((item) => item?.size === sizeName);
  const bundleWeight = bundleItems.reduce((sum, item) => {
    const count = picked[item.product_id._id] ?? 0;
    const itemWeight = item.product_id.variant?.weight || item.product_id.weight || 0;
    return sum + itemWeight * count;
  }, 0);
  const shownWeight = isBundle ? bundleWeight : selectedVariant?.weight || (isVariant ? 0 : weight);
  const sizeList = sizes.map((size) => size?.name).filter(Boolean).join(", ");

  return (
    <>
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="lg:sticky lg:top-30">{children}</div>
        <div>
          <h1 className="text-2xl font-semibold text-primary!">{name}</h1>
          {shortDescription ? <div className="category-description mt-2" dangerouslySetInnerHTML={{ __html: shortDescription }} /> : null}
          <ProductPurchase
            notice={notice}
            isBundle={isBundle}
            bundleItems={bundleItems}
            maxSelection={maxSelection}
            maxProductQuantity={maxProductQuantity}
            bundleStock={bundleStock}
            stockManage={stockManage}
            stockStatus={stockStatus}
            slug={slug}
            name={name}
            isVariant={isVariant}
            variant={variant}
            variants={variants}
            sizes={sizes}
            currency={currency}
            currencySymbol={currencySymbol}
            sizeName={sizeName}
            onSizeChange={selectSize}
            productId={productId}
            picked={picked}
            onPickedChange={setPicked}
          />
        </div>
      </div>
      <ProductTabs
        description={description}
        customNotes={customNotes}
        productId={productId}
        name={name}
        weight={shownWeight}
        size={sizeList}
        reviews={reviews}
        averageRating={averageRating}
        totalReviews={totalReviews}
      />
    </>
  );
}
