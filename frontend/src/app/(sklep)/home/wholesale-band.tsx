import { LogoDot } from "@/components/logo-dot";
import { company } from "@/lib/company";

export function WholesaleBand() {
  return (
    <section aria-labelledby="hurt" className="mt-12 bg-ink text-paper">
      <div className="mx-auto max-w-180 px-2 py-8 md:px-5">
        <p className="text-small font-semibold tracking-label text-accent uppercase">Dla firm</p>
        <h2 id="hurt" className="mt-1 text-title lowercase">
          Ubierzemy całą załogę
          <LogoDot />
        </h2>
        <div className="mt-5 grid max-w-140 gap-4 md:grid-cols-3">
          <p>
            <b className="block font-semibold">Faktura VAT</b>
            na firmę, do każdego zamówienia.
          </p>
          <p>
            <b className="block font-semibold">Darmowa dostawa</b>
            od {company.freeShippingFrom}.
          </p>
          <p>
            <b className="block font-semibold">
              <a href={company.phoneHref} className="whitespace-nowrap link-line">
                {company.phone}
              </a>
            </b>
            odbiera osoba, która zna magazyn, albo napisz:{" "}
            <a href={company.emailHref} className="link-line">
              {company.email}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
