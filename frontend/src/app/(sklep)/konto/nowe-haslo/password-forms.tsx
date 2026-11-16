"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/button";
import { Field, inputClassName } from "@/components/field";
import { sendPasswordReset, setNewPassword } from "@/lib/account";
import { FormError, useAccountForm } from "../account-form";

const PASSWORD_MIN_LENGTH = 8;

export function PasswordForms() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");
  const login = searchParams.get("login");
  const cameFromEmailLink = key !== null && login !== null;

  if (cameFromEmailLink) {
    return <SetPasswordForm login={login} resetKey={key} />;
  }
  return <RequestLinkForm />;
}

function SetPasswordForm({ login, resetKey }: { login: string; resetKey: string }) {
  const router = useRouter();
  const { isSending, errorMessage, submit } = useAccountForm(() => router.push("/konto/"));

  return (
    <form
      onSubmit={(event) => submit(event, (fields) => setNewPassword(login, resetKey, String(fields.get("password"))))}
      className="mt-5 grid max-w-[68ch] gap-3"
    >
      <p>
        Ustaw hasło do konta <b className="font-semibold">{login}</b>. Po zapisaniu od razu Cię zalogujemy.
      </p>
      <Field label={`Nowe hasło, co najmniej ${PASSWORD_MIN_LENGTH} znaków`}>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
          className={inputClassName}
        />
      </Field>
      <FormError message={errorMessage} />
      <div>
        <Button variant="primary" type="submit" disabled={isSending}>
          Zapisz hasło
        </Button>
      </div>
    </form>
  );
}

function RequestLinkForm() {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function requestLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    await sendPasswordReset(String(new FormData(event.currentTarget).get("login")));
    setIsSending(false);
    setIsSent(true);
  }

  if (isSent) {
    return (
      <p role="status" className="mt-5 max-w-[68ch]">
        Jeśli konto istnieje, wysłaliśmy na jego adres e-mail link do ustawienia nowego hasła. Link działa przez 24 godziny.
      </p>
    );
  }
  return (
    <form onSubmit={requestLink} className="mt-5 grid max-w-[68ch] gap-3">
      <p>Podaj e-mail konta. Wyślemy link do ustawienia nowego hasła.</p>
      <Field label="E-mail albo nazwa użytkownika">
        <input name="login" autoComplete="username" required className={inputClassName} />
      </Field>
      <div>
        <Button variant="primary" type="submit" disabled={isSending}>
          Wyślij link
        </Button>
      </div>
    </form>
  );
}
