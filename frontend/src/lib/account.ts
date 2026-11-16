import { type } from "arktype";

export const ACCOUNT_PROXY_PATH = "/sklep-api/konto";

const address = type({
  first_name: "string",
  last_name: "string",
  company: "string",
  nip: "string",
  phone: "string",
  address_1: "string",
  postcode: "string",
  city: "string",
});
export type Address = typeof address.infer;

const account = type({ email: "string", address });
export type Account = typeof account.infer;

const orderSummary = type({
  id: "number",
  number: "string",
  date: "string",
  status: "string",
  totalGrosze: "number",
  key: "string",
  email: "string",
});
export type OrderSummary = typeof orderSummary.infer;

const accountError = type({ message: "string" });

export type AccountResult = { ok: true; account: Account } | { ok: false; message: string };

export async function readAccount(): Promise<Account | null> {
  const response = await fetch(`${ACCOUNT_PROXY_PATH}/`);
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Account responded with ${response.status}`);
  }
  return account.assert(await response.json());
}

export async function listOrders() {
  const response = await fetch(`${ACCOUNT_PROXY_PATH}/zamowienia/`);
  if (!response.ok) {
    throw new Error(`Account orders responded with ${response.status}`);
  }
  return orderSummary.array().assert(await response.json());
}

export function signIn(login: string, password: string) {
  return postForAccount("/logowanie/", { login, password });
}

export function register(email: string) {
  return postForAccount("/rejestracja/", { email });
}

export function saveAddress(changedAddress: Address) {
  return postForAccount("/adres/", changedAddress);
}

export function setNewPassword(login: string, key: string, password: string) {
  return postForAccount("/haslo/nowe/", { login, key, password });
}

export async function sendPasswordReset(login: string) {
  const response = await postToAccount("/haslo/przypomnienie/", { login });
  if (!response.ok) {
    throw new Error(`Password reset responded with ${response.status}`);
  }
}

export async function signOut() {
  const response = await postToAccount("/wylogowanie/", {});
  if (!response.ok) {
    throw new Error(`Sign out responded with ${response.status}`);
  }
}

async function postForAccount(path: string, body: object): Promise<AccountResult> {
  const response = await postToAccount(path, body);
  const responseBody: unknown = await response.json();
  if (!response.ok) {
    return { ok: false, message: accountError.assert(responseBody).message };
  }
  return { ok: true, account: account.assert(responseBody) };
}

function postToAccount(path: string, body: object) {
  return fetch(`${ACCOUNT_PROXY_PATH}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
