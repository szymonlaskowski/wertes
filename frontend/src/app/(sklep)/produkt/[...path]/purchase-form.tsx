import { BuyRow } from "./buy-row";

export function PurchaseForm({ productId, cartUrl }: { productId: number; cartUrl: string }) {
  return (
    <form action={cartUrl} method="get" className="flex flex-col gap-3">
      <input type="hidden" name="add-to-cart" value={productId} />
      <BuyRow />
    </form>
  );
}
