import type { OrderItemRow } from "@/lib/admin/queries";

/** « 2 × Chouchous imprimés — Marbré » */
export function itemsSummary(items: OrderItemRow[]) {
  return items.map((i) => `${i.quantity} × ${i.productName}${i.variantName ? ` — ${i.variantName}` : ""}`).join(", ");
}
