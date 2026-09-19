import { NextResponse } from "next/server";
import { isLocale, tpl } from "@/lib/i18n";
import { getPageContent } from "@/lib/i18n/pages";

export async function POST(request: Request) {
  let body: {
    name?: unknown;
    email?: unknown;
    message?: unknown;
    locale?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const locale = isLocale(body.locale) ? body.locale : "en";

  if (
    !name ||
    name.length > 120 ||
    !email ||
    email.length > 120 ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    !message ||
    message.length > 4000
  ) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // No email service is configured yet, so the API hands the message off to
  // the visitor's own mail client via a mailto: URL built from localized
  // templates. Swap `contact.email` for a real provider to send server-side.
  const contact = getPageContent(locale).contact;
  const bodyText = tpl(contact.mailtoBody, { name, email, message });
  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(contact.mailtoSubject)}&body=${encodeURIComponent(bodyText)}`;
  return NextResponse.json({ mailto });
}