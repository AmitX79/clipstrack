"use client";

import { useState, type FormEvent } from "react";
import type { PageContent } from "@/lib/i18n/pages";
import type { Locale } from "@/lib/i18n";

const fieldClass =
  "h-11 w-full rounded-[6px] border border-hairline px-3 text-sm text-ink " +
  "bg-elevated placeholder:text-faint focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-canvas focus-visible:border-link";

export function ContactForm({
  content,
  locale,
}: {
  content: PageContent;
  locale: Locale;
}) {
  const c = content.contact;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (
      !name.trim() ||
      !/^\S+@\S+\.\S+$/.test(email.trim()) ||
      !message.trim()
    ) {
      setError(c.form.invalid);
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, locale }),
      });
      const data = (await res.json()) as { mailto?: string }; 
      if (res.ok && typeof data.mailto === "string") {
        window.location.href = data.mailto;
      } else {
        setError(c.form.invalid);
      }
    } catch {
      setError(c.form.invalid);
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-lg space-y-4"
      noValidate
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-body">{c.form.name}</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={c.form.namePlaceholder}
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-body">{c.form.email}</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={c.form.emailPlaceholder}
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-body">{c.form.message}</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={c.form.messagePlaceholder}
          rows={5}
          className="w-full resize-y rounded-[6px] border border-hairline px-3 py-2 text-sm text-ink bg-elevated placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:border-link"
        />
      </label>

      {error && (
        <p role="status" className="text-sm text-warning-deep">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex h-11 items-center rounded-[6px] bg-ink px-6 text-base font-medium text-on-ink hover:bg-ink-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? "…" : c.form.submit}
      </button>

      <p className="text-sm text-mute">{c.form.mailtoNote}</p>
    </form>
  );
}