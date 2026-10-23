import { Button } from "@/components/button";
import { company } from "@/lib/company";

const offers = [
  { title: "Faktura", detail: "Faktura VAT na\u00a0firmę do\u00a0każdego zamówienia" },
  { title: "Dostawa", detail: `Darmowa od\u00a0${company.freeShippingFrom}` },
  { title: "Znakowanie", detail: "Logo firmy na\u00a0odzieży: folia flex, flock, sublimacja" },
  { title: "Doradztwo", detail: "Telefon odbiera osoba, która zna magazyn" },
];

export function WholesaleBand() {
  return (
    <section aria-labelledby="dla-firm" className="bg-ink text-paper">
      <div className="page-width grid gap-5 py-10 lg:grid-cols-2">
        <div>
          <h2 id="dla-firm" className="text-title md:text-display">
            Ubierzemy całą załogę.
          </h2>
          <p className="mt-2">
            Kaski, buty i&nbsp;odzież dla całej firmy w&nbsp;jednym zamówieniu, a&nbsp;na kurtkach i&nbsp;kamizelkach
            umieścimy logo twojej firmy.
          </p>
          <p className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" href={company.phoneHref}>
              Zadzwoń: {company.phone}
            </Button>
            <Button variant="secondary" href={company.emailHref}>
              Napisz: {company.email}
            </Button>
          </p>
        </div>
        <dl className="grid content-end gap-x-5 gap-y-3 sm:grid-cols-2">
          {offers.map((offer) => (
            <div key={offer.title}>
              <dt className="text-small font-semibold text-accent">{offer.title}</dt>
              <dd>{offer.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
