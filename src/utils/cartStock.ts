import type { Summary } from "@/server/types/cart";

export function cartStockIssue(summary?: Summary | null) {
  const itemCount = summary?.item_count ?? 0;
  const outOfStockCount = summary?.out_of_stock_count ?? 0;
  const stockMessage = summary?.stock_message?.trim() ?? "";
  const blocked = itemCount > 0 && outOfStockCount > 0;

  return { blocked, message: blocked ? stockMessage : "" };
}
