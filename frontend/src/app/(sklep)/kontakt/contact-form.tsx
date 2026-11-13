"use client";

import Link from "next/link";
import Script from "next/script";
import { type FormEvent, type ReactNode, useState } from "react";
import { Button } from "@/components/button";
import { Field, inputClassName } from "@/components/field";
import { company } from "@/lib/company";
import { type ContactFormResult, RECAPTCHA_SITE_KEY, sendContactForm } from "@/lib/contact-form";

declare global {
  interface Window {
    grecaptcha?: {
      ready(callback: () => void): void;
      execute(siteKey: string, options: { action: string }): Promise<string>;
    };
  }
}

const RECAPTCHA_SCRIPT_URL = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
const NO_FIELD_ERRORS: Record<string, string> = {};

export function ContactForm() {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<ContactFormResult | null>(null);
  const fieldErrors = result === null ? NO_FIELD_ERRORS : result.fieldErrors;

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSending(true);
    const sendResult = await sendWithRecaptcha(new FormData(form));
    setResult(sendResult);
    setIsSending(false);
    if (sendResult.isSent) {
      form.reset();
    }
  }

  return (
    <form onSubmit={send} className="grid gap-2">
      <Script src={RECAPTCHA_SCRIPT_URL} strategy="lazyOnload" />
      <Field label="Imię" error={fieldErrors["your-name"]}>
        <input name="your-name" autoComplete="name" required aria-invalid={"your-name" in fieldErrors} className={inputClassName} />
      </Field>
      <Field label="E-mail" error={fieldErrors["your-email"]}>
        <input
          name="your-email"
          type="email"
          autoComplete="email"
          required
          maxLength={400}
          aria-invalid={"your-email" in fieldErrors}
          className={inputClassName}
        />
      </Field>
      <Field label="Wiadomość" error={fieldErrors["your-message"]}>
        <textarea name="your-message" rows={6} maxLength={2000} aria-invalid={"your-message" in fieldErrors} className={inputClassName} />
      </Field>
      <p className="text-small text-mute">
        Przekazane przez Państwa dane osobowe będą przetwarzane przez {company.legalName} w&nbsp;celach związanych
        z&nbsp;udzieleniem odpowiedzi na Państwa żądanie zgłoszone za pośrednictwem formularza kontaktowego.
        Przysługuje Państwu prawo do żądania od administratora danych dostępu do swoich danych, ich sprostowania,
        usunięcia lub ograniczenia przetwarzania, lub sprzeciwu wobec przetwarzania, a&nbsp;także prawo wniesienia skargi
        do organu nadzorczego. Odbiorcami danych mogą być podmioty zajmujące się obsługą informatyczną lub marketingową
        administratora danych. Dane osobowe będą przetwarzane do czasu udzielenia odpowiedzi na Państwa żądanie. Więcej
        informacji w&nbsp;
        <Link href="/polityka-prywatnosci/" className="link-line">
          polityce prywatności
        </Link>
        .
      </p>
      <Consent name="acceptance-132">
        Zgadzam się na otrzymywanie drogą elektroniczną na wskazany przeze mnie adres e-mail informacji handlowych od{" "}
        {company.legalName} zgodnie z&nbsp;ustawą z&nbsp;dnia 18 lipca 2002 roku o&nbsp;świadczeniu usług drogą
        elektroniczną oraz z&nbsp;ustawą z&nbsp;dnia 16 lipca 2004 roku prawo telekomunikacyjne.
      </Consent>
      <Consent name="acceptance-265">
        Oświadczam, że zapoznałem/zapoznałam się z&nbsp;
        <Link href="/regulamin/" className="link-line">
          Regulaminem
        </Link>{" "}
        i&nbsp;akceptuję jego treść.
      </Consent>
      <p>
        <Button variant="primary" type="submit" disabled={isSending}>
          {isSending ? "Wysyłanie…" : "Wyślij wiadomość"}
        </Button>
      </p>
      <p role="status" className="font-semibold">
        {result?.message}
      </p>
      <p className="text-small text-mute">
        Formularz chroni reCAPTCHA. Obowiązują{" "}
        <a href="https://policies.google.com/privacy" className="link-line">
          Polityka prywatności
        </a>{" "}
        i&nbsp;
        <a href="https://policies.google.com/terms" className="link-line">
          Warunki korzystania z&nbsp;usług
        </a>{" "}
        Google.
      </p>
    </form>
  );
}

function Consent({ name, children }: { name: string; children: ReactNode }) {
  return (
    <label className="flex items-start gap-1 text-small">
      <input type="checkbox" name={name} value="1" required className="mt-0.5 size-2 shrink-0 accent-ink" />
      <span>{children}</span>
    </label>
  );
}

async function sendWithRecaptcha(form: FormData): Promise<ContactFormResult> {
  try {
    const recaptchaToken = await readRecaptchaToken();
    return await sendContactForm(form, recaptchaToken);
  } catch {
    return {
      isSent: false,
      message: `Nie udało się wysłać wiadomości. Zadzwoń pod ${company.phone} albo napisz na ${company.email}.`,
      fieldErrors: NO_FIELD_ERRORS,
    };
  }
}

async function readRecaptchaToken() {
  const recaptcha = window.grecaptcha;
  if (recaptcha === undefined) {
    throw new Error("reCAPTCHA did not load");
  }
  await new Promise<void>((resolve) => recaptcha.ready(resolve));
  return recaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contactform" });
}
