import { AddToCartForm } from "./add-to-cart-form";

export function QuickAddButton({ productId, productName, cartUrl }: { productId: number; productName: string; cartUrl: string }) {
  return (
    <AddToCartForm
      cartUrl={cartUrl}
      className="contents"
      withQuantity={false}
      submitLabel={
        <>
          Dodaj do koszyka<span className="sr-only">: {productName}</span>
        </>
      }
    >
      <input type="hidden" name="add-to-cart" value={productId} />
    </AddToCartForm>
  );
}
