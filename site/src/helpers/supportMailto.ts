import config from "../config/config.json";

// Shared construction of `mailto:` links to support, used by SupportEmailLink.vue
// (the usual case) and by callers that need a bare href — e.g. the offer page, whose
// fineprint is an HTML string and so can't host a component.

export interface SupportMailtoOptions {
  email?: string; // defaults to the configured support address
  subject?: string;
  body?: string; // sits above the writing space, e.g. diagnostic details
  footer?: string; // sits below the writing space, e.g. the offer link
}

// Wraps details in a delimited block so they stand out from the customer's own text:
//   === License Details
//   Name: …
//   ===
export function infoBlock(info: string, title: string): string {
  return `=== ${title}\n${info.trim()}\n===`;
}

export function supportMailtoHref(options: SupportMailtoOptions = {}): string {
  const { email, subject, body, footer } = options;
  const url = new URL(`mailto:${encodeURIComponent(email || config.pilotmoon.supportEmail)}`);
  if (subject) {
    url.searchParams.set("subject", subject);
  }
  // A trailing blank line after `body` (and a leading one before `footer`) leaves the
  // customer somewhere to type between the two.
  const parts = [body ? `${body.trim()}\n\n` : "", footer ? `\n\n${footer.trim()}\n` : ""];
  const text = parts.join("");
  if (text) {
    url.searchParams.set("body", text);
  }
  // searchParams encodes spaces as "+", which mail clients show literally.
  return url.href.replaceAll("+", "%20");
}
