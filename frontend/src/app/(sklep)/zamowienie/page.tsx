import { type } from "arktype";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageTitle } from "@/components/page-title";
import { formatGrosze } from "@/lib/cart";
import { company } from "@/lib/company";
import { getFromWordpress } from "@/lib/store-api";

export const metadata: Metadata = { title: "Zamówienie", robots: { index: false } };

const placedOrder = type({
  id: "number",
  status: "string",
  totals: { total_price: "string" },
});
type PlacedOrder = typeof placedOrder.infer;

const orderLookup = type({ id: "string.digits", key: "string > 0", email: "string.email" });

const STATUS_MESSAGES = new Map([
  ["pending", "Czekamy na płatność. Jeśli już zapłaciłeś, potwierdzenie przyjdzie e-mailem w ciągu kilku minut."],
  ["on-hold", "Czekamy na wpłatę. Fakturę do zapłaty wyślemy e-mailem."],
  ["processing", "Płatność przyjęta, kompletujemy zamówienie."],
  ["completed", "Zamówienie zrealizowane."],
  ["failed", "Płatność nie powiodła się. Zadzwoń do nas, pomożemy dokończyć zamówienie."],
  ["cancelled", "Zamówienie anulowane."],
]);
const ACCEPTED_ORDER_MESSAGE = "Zamówienie przyjęte.";

export default function OrderConfirmationPage(props: PageProps<"/zamowienie">) {
  return (
    <main className="page-width pt-3 pb-10">
      <Suspense fallback={<p role="status">Wczytuję zamówienie…</p>}>
        <OrderConfirmation searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function OrderConfirmation({ searchParams }: { searchParams: PageProps<"/zamowienie">["searchParams"] }) {
  const lookup = orderLookup(await searchParams);
  if (lookup instanceof type.errors) {
    notFound();
  }
  const order = await findOrder(lookup.id, lookup.key, lookup.email);
  if (order === undefined) {
    notFound();
  }

  return (
    <>
      <PageTitle>Dziękujemy za zamówienie</PageTitle>
      <dl className="mt-5 grid max-w-[68ch] grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="font-semibold">Numer zamówienia</dt>
        <dd className="tabular-nums">{order.id}</dd>
        <dt className="font-semibold">Do zapłaty brutto</dt>
        <dd className="tabular-nums">{formatGrosze(Number(order.totals.total_price))}</dd>
        <dt className="font-semibold">Status</dt>
        <dd>{statusMessage(order)}</dd>
      </dl>
      <p className="mt-5 max-w-[68ch]">
        Potwierdzenie wysłaliśmy na {lookup.email}. Pytania? Zadzwoń pod{" "}
        <a href={company.phoneHref} className="link-line">
          {company.phone}
        </a>{" "}
        albo napisz na{" "}
        <a href={company.emailHref} className="link-line">
          {company.email}
        </a>
        .
      </p>
      <p className="mt-3">
        <Link href="/" className="link-line">
          Wróć do sklepu
        </Link>
      </p>
    </>
  );
}

async function findOrder(id: string, key: string, email: string) {
  const params = new URLSearchParams({ key, billing_email: email });
  const response = await getFromWordpress(`/wp-json/wc/store/v1/order/${id}?${params}`);
  const isUnknownOrder = response.status === 404 || response.status === 403 || response.status === 401;
  if (isUnknownOrder) {
    return undefined;
  }
  if (!response.ok) {
    throw new Error(`WordPress order ${id} responded with ${response.status}`);
  }
  return placedOrder.assert(await response.json());
}

function statusMessage(order: PlacedOrder) {
  const message = STATUS_MESSAGES.get(order.status);
  if (message === undefined) {
    return ACCEPTED_ORDER_MESSAGE;
  }
  return message;
}
