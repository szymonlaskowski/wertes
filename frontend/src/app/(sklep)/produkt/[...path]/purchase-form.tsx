import { AddToCartForm } from "@/components/cart/add-to-cart-form";
import type { SaleUnit } from "@/lib/sale-unit";

type PurchaseFormProps = { productId: number; cartUrl: string; unit: SaleUnit };

export function PurchaseForm({ productId, cartUrl, unit }: PurchaseFormProps) {
  return (
    <AddToCartForm cartUrl={cartUrl} className="flex flex-col gap-3" quantityUnit={unit.countOf} submitLabel="Dodaj do koszyka">
      <input type="hidden" name="add-to-cart" value={productId} />
    </AddToCartForm>
  );
}
