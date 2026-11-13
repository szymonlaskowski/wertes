import { type } from "arktype";

export const CONTACT_FORM_PROXY_PATH = "/sklep-api/kontakt/";
export const CONTACT_FORM_ID = 19;
export const RECAPTCHA_SITE_KEY = "6Lcx-u8nAAAAAGlK_Ywl23xV-L6I9oNucnK77aZL";

const contactFormFeedback = type({
  status: "string",
  message: "string",
  "invalid_fields?": type({ field: "string", message: "string" }).array(),
});

export type ContactFormResult = {
  isSent: boolean;
  message: string;
  fieldErrors: Record<string, string>;
};

export async function sendContactForm(form: FormData, recaptchaToken: string): Promise<ContactFormResult> {
  form.set("_wpcf7", String(CONTACT_FORM_ID));
  form.set("_wpcf7_unit_tag", `wpcf7-f${CONTACT_FORM_ID}-o1`);
  form.set("_wpcf7_locale", "pl_PL");
  form.set("_wpcf7_recaptcha_response", recaptchaToken);

  const response = await fetch(CONTACT_FORM_PROXY_PATH, { method: "POST", body: form });
  const feedback = contactFormFeedback.assert(await response.json());

  const fieldErrors: Record<string, string> = {};
  for (const invalidField of feedback.invalid_fields ?? []) {
    fieldErrors[invalidField.field] = invalidField.message;
  }
  return { isSent: feedback.status === "mail_sent", message: feedback.message, fieldErrors };
}
