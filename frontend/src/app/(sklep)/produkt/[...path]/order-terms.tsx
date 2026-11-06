import { company } from "@/lib/company";
import { wordpressUrl } from "@/lib/store-api";

export function OrderTerms() {
  return (
    <div className="grid gap-3 bg-surface p-3">
      <BulkDiscounts />
      <OrderHelp />
    </div>
  );
}

function BulkDiscounts() {
  return (
    <section aria-labelledby="rabaty">
      <h2 id="rabaty" className="font-semibold">
        Kupujesz więcej? Zapłacisz mniej
      </h2>
      <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 text-small">
        {company.bulkDiscounts.map((discount) => (
          <div key={discount.code} className="contents">
            <dt>Koszyk od {discount.from}</dt>
            <dd>
              <b className="font-semibold">{discount.percent}</b> z kodem{" "}
              <b className="font-semibold">{discount.code}</b>
            </dd>
          </div>
        ))}
      </dl>
      <a href={wordpressUrl("/rabaty-na-duze-zamowienia/")} className="mt-1 inline-block text-small font-semibold link-line">
        Warunki rabatów i wycena dla firm
      </a>
    </section>
  );
}

function OrderHelp() {
  return (
    <dl className="grid gap-2 text-small sm:grid-cols-2">
      <div>
        <dt className="font-semibold">Dostawa</dt>
        <dd>
          Darmowa od {company.freeShippingFrom}, faktura VAT do każdego zamówienia.
        </dd>
      </div>
      <div>
        <dt className="font-semibold">Pomoc w doborze</dt>
        <dd>
          <a href={company.phoneHref} className="link-line">
            {company.phone}
          </a>{" "}
          albo{" "}
          <a href={company.emailHref} className="link-line">
            {company.email}
          </a>
        </dd>
      </div>
    </dl>
  );
}
