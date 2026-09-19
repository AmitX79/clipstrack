"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminLogin } from "./actions";

export function AdminLoginForm({
  inputClass,
  buttonClass,
  configured,
}: {
  inputClass: string;
  buttonClass: string;
  configured: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await adminLogin(formData);
      if (!result.ok) {
        setError("Incorrect secret.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      {!configured ? (
        <p className="mt-3 text-sm text-error">
          ADMIN_SECRET is not set on this server.
        </p>
      ) : (
        <>
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
            <label htmlFor="secret" className="flex flex-col gap-1">
              <span className="mono-eyebrow text-mute">Admin secret</span>
              <input
                id="secret"
                name="secret"
                type="password"
                autoComplete="current-password"
                required
                className={inputClass}
              />
            </label>
            <button
              type="submit"
              disabled={isPending}
              className={`${buttonClass} bg-ink text-on-ink hover:bg-ink-press disabled:opacity-60`}
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>
          {error && (
            <p role="status" className="mt-3 text-sm text-error">
              {error}
            </p>
          )}
          <p className="mt-4 text-xs text-faint">
            Scripts can also use{" "}
            <code className="text-mute">/admin/login?secret=&lt;value&gt;</code>
            .
          </p>
        </>
      )}
    </>
  );
}