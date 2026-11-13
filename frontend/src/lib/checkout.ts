import { type } from "arktype";
import { decodeHtmlEntities } from "./html-entities";

export const CHECKOUT_PATH = "/kasa/";
export const CHECKOUT_PROXY_PATH = "/sklep-api/checkout";

export const SUPPORTED_PAYMENT_METHODS = [
  { id: "payublik", label: "BLIK", description: "Przekierujemy Cię na stronę wpisania kodu BLIK." },
  { id: "payustandard", label: "Płać z PayU", description: "Przekierujemy Cię na stronę wyboru metody płatności." },
  { id: "payucreditcard", label: "Płatność kartą", description: "Przekierujemy Cię do formularza danych karty." },
  { id: "p24-online-payments", label: "Przelewy24", description: "Przekierujemy Cię do płatności Przelewy24." },
  { id: "payupaypo", label: "Płacę później z PayPo", description: "Przekierujemy Cię na stronę PayPo." },
  { id: "payuklarna", label: "Płacę później z Klarną", description: "Zapłać za 30 dni lub w 3 ratach." },
  {
    id: "bacs",
    label: "Faktura proforma",
    description:
      "Wyślemy Ci e-mailem fakturę do zapłaty. W tytule przelewu podaj numer zamówienia albo faktury. Wyślemy zamówienie po zaksięgowaniu wpłaty.",
  },
  {
    id: "cheque",
    label: "Przelew z terminem 14 dni",
    description: "Tylko dla jednostek budżetowych. Podaj dane nabywcy i NIP.",
  },
];

export const PARCEL_POINT_OPERATOR_BY_SHIPPING_INSTANCE = new Map([
  [61, "DPD"],
  [18, "INPOST"],
  [57, "RUCH"],
]);

export type ParcelPoint = {
  apm_access_point_id: string;
  apm_supplier: string;
  apm_name: string;
  apm_foreign_access_point_id: string;
  apm_street: string;
  apm_city: string;
  apm_postal_code: string;
  apm_country_code: string;
};

export type OrderRequest = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  company: string;
  taxId: string;
  street: string;
  postcode: string;
  city: string;
  customerNote: string;
  paymentMethod: string;
  parcelPoint: ParcelPoint | null;
};

const placedOrder = type({ payment_result: { redirect_url: "string" } });

const checkoutError = type({ message: type("string").pipe(decodeHtmlEntities) });

export type PlaceOrderResult = { ok: true; redirectUrl: string } | { ok: false; message: string };

const POLAND = "PL";

export async function placeOrder(token: string, order: OrderRequest): Promise<PlaceOrderResult> {
  const response = await fetch(`${CHECKOUT_PROXY_PATH}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cart-Token": token },
    body: JSON.stringify(checkoutRequestBody(order)),
  });
  const responseBody: unknown = await response.json();
  if (!response.ok) {
    return { ok: false, message: checkoutError.assert(responseBody).message };
  }
  const placed = placedOrder.assert(responseBody);
  return { ok: true, redirectUrl: placed.payment_result.redirect_url };
}

function checkoutRequestBody(order: OrderRequest) {
  const address = {
    first_name: order.firstName,
    last_name: order.lastName,
    company: order.company,
    address_1: order.street,
    address_2: "",
    city: order.city,
    state: "",
    postcode: order.postcode,
    country: POLAND,
    phone: order.phone,
  };
  const extensions: Record<string, object> = {
    "wpdesk-fakturownia-checkout": { _billing_nip: order.taxId, _billing_company: order.company },
  };
  if (order.parcelPoint !== null) {
    extensions.apaczka = { "apaczka-point": JSON.stringify(order.parcelPoint) };
  }
  return {
    billing_address: { ...address, email: order.email },
    shipping_address: address,
    customer_note: order.customerNote,
    payment_method: order.paymentMethod,
    extensions,
  };
}
