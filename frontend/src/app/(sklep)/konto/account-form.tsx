"use client";

import { type FormEvent, useState } from "react";
import type { Account, AccountResult } from "@/lib/account";

export function useAccountForm(onAccount: (account: Account) => void) {
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>, send: (fields: FormData) => Promise<AccountResult>) {
    event.preventDefault();
    setIsSending(true);
    const result = await send(new FormData(event.currentTarget));
    setIsSending(false);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    setErrorMessage(null);
    onAccount(result.account);
  }

  return { isSending, errorMessage, submit };
}

export function FormError({ message }: { message: string | null }) {
  if (message === null) {
    return null;
  }
  return (
    <p role="alert" className="font-semibold">
      {message}
    </p>
  );
}
