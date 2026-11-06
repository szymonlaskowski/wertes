import { type } from "arktype";
import { decodeHtmlEntities } from "./html-entities";

const textWithEntities = type("string").pipe(decodeHtmlEntities);

const cartItem = type({
  key: "string",
  id: "number",
  quantity: "number",
  name: textWithEntities,
  sku: "string",
  permalink: "string",
  images: type({ thumbnail: "string", alt: "string" }).array(),
  variation: type({ attribute: textWithEntities, value: textWithEntities }).array(),
  quantity_limits: type({ minimum: "number", maximum: "number" }),
  totals: type({ line_subtotal: "string", line_subtotal_tax: "string" }),
});
export type CartItem = typeof cartItem.infer;

const cart = type({
  items: cartItem.array(),
  items_count: "number",
  totals: type({ total_items: "string", total_items_tax: "string" }),
});
export type Cart = typeof cart.infer;

const cartError = type({ message: textWithEntities });

export type CartLine = { productId: number; quantity: number; variation: { attribute: string; value: string }[] };

export type CartResponse = { ok: true; cart: Cart; token: string } | { ok: false; message: string };

const ATTRIBUTE_FIELD_PREFIX = "attribute_";

export const CART_PROXY_PATH = "/sklep-api/cart";

export function cartLineFromForm(form: FormData): CartLine {
  const variationId = form.get("variation_id");
  const productId = variationId === null ? form.get("add-to-cart") : variationId;
  const variation: CartLine["variation"] = [];
  for (const [fieldName, fieldValue] of form) {
    if (fieldName.startsWith(ATTRIBUTE_FIELD_PREFIX)) {
      variation.push({ attribute: fieldName, value: String(fieldValue) });
    }
  }
  return { productId: Number(productId), quantity: Number(form.get("quantity")), variation };
}

export function readCart(token: string | null) {
  return requestCart("/", token, "GET");
}

export function addCartLine(token: string, line: CartLine) {
  return requestCart("/add-item/", token, "POST", {
    id: line.productId,
    quantity: line.quantity,
    variation: line.variation,
  });
}

export function changeCartItemQuantity(token: string, key: string, quantity: number) {
  return requestCart("/update-item/", token, "POST", { key, quantity });
}

export function removeCartItem(token: string, key: string) {
  return requestCart("/remove-item/", token, "POST", { key });
}

async function requestCart(
  path: string,
  token: string | null,
  method: "GET" | "POST",
  body?: object,
): Promise<CartResponse> {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (token !== null) {
    headers.set("Cart-Token", token);
  }
  const response = await fetch(`${CART_PROXY_PATH}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const responseBody: unknown = await response.json();
  if (!response.ok) {
    return { ok: false, message: cartError.assert(responseBody).message };
  }

  const responseToken = response.headers.get("Cart-Token");
  if (responseToken === null) {
    throw new Error(`Store API cart${path} did not return a Cart-Token header`);
  }
  return { ok: true, cart: cart.assert(responseBody), token: responseToken };
}

export function formatGrosze(grosze: number) {
  return `${(grosze / 100).toFixed(2)} zł`;
}
