"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { Field, inputClassName } from "@/components/field";
import { type Account, readAccount, register, signIn } from "@/lib/account";
import { company } from "@/lib/company";
import { AccountDashboard } from "./account-dashboard";
import { FormError, useAccountForm } from "./account-form";

export function AccountView() {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    readAccount()
      .then(setAccount, () => setLoadFailed(true))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <p role="status" className="mt-5">
        Wczytuję konto…
      </p>
    );
  }
  if (loadFailed) {
    return (
      <p role="alert" className="mt-5">
        Konto jest chwilowo niedostępne. Zamówienie złożysz bez logowania, a&nbsp;w&nbsp;sprawie wcześniejszych zadzwoń:{" "}
        <a href={company.phoneHref} className="link-line">
          {company.phone}
        </a>
        .
      </p>
    );
  }
  if (account === null) {
    return (
      <div className="mt-5 grid items-start gap-8 lg:grid-cols-2">
        <SignInForm onSignedIn={setAccount} />
        <RegisterForm onRegistered={setAccount} />
      </div>
    );
  }
  return <AccountDashboard account={account} onAccountChange={setAccount} onSignedOut={() => setAccount(null)} />;
}

function SignInForm({ onSignedIn }: { onSignedIn: (account: Account) => void }) {
  const { isSending, errorMessage, submit } = useAccountForm(onSignedIn);

  function signInWith(fields: FormData) {
    return signIn(String(fields.get("login")), String(fields.get("password")));
  }

  return (
    <section aria-labelledby="logowanie" className="grid max-w-[68ch] gap-3">
      <h2 id="logowanie" className="font-semibold">
        Logowanie
      </h2>
      <form onSubmit={(event) => submit(event, signInWith)} className="grid gap-2">
        <Field label="E-mail albo nazwa użytkownika">
          <input name="login" autoComplete="username" required className={inputClassName} />
        </Field>
        <Field label="Hasło">
          <input name="password" type="password" autoComplete="current-password" required className={inputClassName} />
        </Field>
        <FormError message={errorMessage} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Button variant="primary" type="submit" disabled={isSending}>
            Zaloguj się
          </Button>
          <Link href="/konto/nowe-haslo/" className="text-small link-line">
            Nie pamiętasz hasła?
          </Link>
        </div>
      </form>
    </section>
  );
}

function RegisterForm({ onRegistered }: { onRegistered: (account: Account) => void }) {
  const { isSending, errorMessage, submit } = useAccountForm(onRegistered);

  function registerWith(fields: FormData) {
    return register(String(fields.get("email")));
  }

  return (
    <section aria-labelledby="nowe-konto" className="grid max-w-[68ch] gap-3">
      <h2 id="nowe-konto" className="font-semibold">
        Nowe konto
      </h2>
      <p>Na konto zapiszesz dane do faktury i zobaczysz wszystkie zamówienia. Hasło ustawisz z linku, który wyślemy e-mailem.</p>
      <form onSubmit={(event) => submit(event, registerWith)} className="grid gap-2">
        <Field label="E-mail">
          <input name="email" type="email" autoComplete="email" required className={inputClassName} />
        </Field>
        <label className="flex items-start gap-1 text-small">
          <input type="checkbox" required className="mt-0.5 size-2 shrink-0 accent-ink" />
          <span>
            Akceptuję{" "}
            <Link href="/regulamin/" className="link-line">
              regulamin sklepu
            </Link>{" "}
            i&nbsp;
            <Link href="/polityka-prywatnosci/" className="link-line">
              politykę prywatności
            </Link>
            .
          </span>
        </label>
        <FormError message={errorMessage} />
        <div>
          <Button variant="primary" type="submit" disabled={isSending}>
            Załóż konto
          </Button>
        </div>
      </form>
    </section>
  );
}
