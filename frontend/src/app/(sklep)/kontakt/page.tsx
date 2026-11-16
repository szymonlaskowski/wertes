import type { Metadata } from "next";
import { PageTitle } from "@/components/page-title";
import { company } from "@/lib/company";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Kontakt" };

const phoneLines = [
  { topic: "Informacje handlowe lub sprawy związane ze złożonym zamówieniem", phones: ["+48 780 531 108"] },
  { topic: "Informacje księgowe lub logistyczne", phones: ["+48 517 609 665", "+48 507 121 971"] },
];

export default function ContactPage() {
  return (
    <main className="page-width pt-3 pb-10">
      <PageTitle>Kontakt</PageTitle>
      <div className="mt-5 grid items-start gap-8 lg:grid-cols-2">
        <section aria-labelledby="dane-kontaktowe" className="grid gap-4">
          <h2 id="dane-kontaktowe" className="sr-only">
            Dane kontaktowe
          </h2>
          <p className="grid text-figure md:text-title">
            <a href={company.phoneHref} className="justify-self-start link-line">
              {company.phone}
            </a>
            <a href={company.emailHref} className="justify-self-start link-line">
              {company.email}
            </a>
          </p>
          <address className="not-italic">
            <span className="font-semibold">{company.legalName}</span>
            <br />
            {company.address}
            <br />
            NIP {company.taxId}
          </address>
          <dl className="grid gap-2">
            {phoneLines.map((line) => (
              <div key={line.topic}>
                <dt className="text-small text-mute">{line.topic}</dt>
                {line.phones.map((phone) => (
                  <dd key={phone}>
                    <a href={`tel:${phone.replaceAll(" ", "")}`} className="link-line tabular-nums">
                      {phone}
                    </a>
                  </dd>
                ))}
              </div>
            ))}
            <div>
              <dt className="text-small text-mute">Godziny pracy</dt>
              <dd>Poniedziałek – piątek, 8:00 – 16:00</dd>
            </div>
          </dl>
        </section>
        <section aria-labelledby="szybki-kontakt">
          <h2 id="szybki-kontakt" className="mb-2 font-semibold">
            Napisz do nas
          </h2>
          <ContactForm />
        </section>
      </div>
    </main>
  );
}
