import { AddToCartForm } from "./add-to-cart-form";

export function QuickAddButton({ productId, productName, cartUrl }: { productId: number; productName: string; cartUrl: string }) {
  return (
    <AddToCartForm
      cartUrl={cartUrl}
      className="contents touch:[&_button]:min-w-6 touch:[&_button]:px-1.5"
      withQuantity={false}
      submitLabel={
        <>
          <span className="touch:sr-only">Dodaj do koszyka</span>
          <span aria-hidden="true" className="mouse:hidden">
            +
          </span>
          <span className="sr-only">: {productName}</span>
        </>
      }
    >
      <input type="hidden" name="add-to-cart" value={productId} />
    </AddToCartForm>
  );
}
