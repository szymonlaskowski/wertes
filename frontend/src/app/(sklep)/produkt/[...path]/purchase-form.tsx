import { AddToCartForm } from "@/components/cart/add-to-cart-form";

export function PurchaseForm({ productId, cartUrl }: { productId: number; cartUrl: string }) {
  return (
    <AddToCartForm cartUrl={cartUrl} className="flex flex-col gap-3" withQuantity submitLabel="Dodaj do koszyka">
      <input type="hidden" name="add-to-cart" value={productId} />
    </AddToCartForm>
  );
}
