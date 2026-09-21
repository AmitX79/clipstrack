"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { allowConsent } from "@/app/actions";
import { getDictionary, type Locale } from "@/lib/i18n";
import { Spinner } from "@/components/Spinner";

// Consent state. The ct_uid identity cookie is written only when a visitor
// agrees; a declined visitor gets nothing (their no-answer is remembered in
// localStorage so the banner doesn't nag on every visit). Until a visitor
// agrees, consent-requiring actions (adding channels) are gated behind the
// banner which re-opens with a "please agree to continue" framing.
type ConsentStatus = "granted" | "declined" | "untouched";
type ConsentMode = "first" | "blocked" | null;

interface ConsentApi {
  status: ConsentStatus;
  // Runs `run` immediately if consent is already granted; otherwise re-opens
  // the banner (blocked framing) and runs `run` right after the visitor
  // agrees. Never fires on decline.
  requestConsent: (run: () => void) => void;
}

const ConsentContext = createContext<ConsentApi>({
  status: "untouched",
  requestConsent: () => {},
});

export function useConsent(): ConsentApi {
  return useContext(ConsentContext);
}

const DECLINE_KEY = "clipstrack.consent.declined";

function readDecline(): boolean {
  try {
    return localStorage.getItem(DECLINE_KEY) === "1";
  } catch {
    return false;
  }
}

function readGranted(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith("ct_consent=1"));
}

export function ConsentGate({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dict = getDictionary(locale);
  const [status, setStatus] = useState<ConsentStatus>("untouched");
  const [mode, setMode] = useState<ConsentMode>(null);
  const [busy, setBusy] = useState(false);
  const pendingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (readGranted()) {
      setStatus("granted");
    } else if (readDecline()) {
      setStatus("declined");
    } else {
      setStatus("untouched");
      setMode("first");
    }
  }, []);

  useEffect(() => {
    if (!mode) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mode]);

  const requestConsent = useCallback(
    (run: () => void) => {
      if (status === "granted") {
        run();
        return;
      }
      pendingRef.current = run;
      setMode("blocked");
    },
    [status],
  );

  const handleAllow = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    await allowConsent();
    setStatus("granted");
    const pending = pendingRef.current;
    pendingRef.current = null;
    setMode(null);
    setBusy(false);
    router.refresh();
    if (pending) pending();
  }, [busy, router]);

  const handleDecline = useCallback(() => {
    try {
      localStorage.setItem(DECLINE_KEY, "1");
    } catch {
      /* storage unavailable — the banner will just show again next visit */
    }
    pendingRef.current = null;
    setStatus("declined");
    setMode(null);
  }, []);

  const blocked = mode === "blocked";

  return (
    <ConsentContext.Provider value={{ status, requestConsent }}>
      {children}
      {mode && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-title"
            className="relative w-full max-w-md rounded-md border border-hairline bg-white p-6 shadow-[0px_16px_48px_rgba(0,0,0,0.18)] dark:bg-elevated"
          >
            <p className="mono-eyebrow text-mute">{dict.consent.eyebrow}</p>
            <h2
              id="consent-title"
              className="mt-2 text-xl font-semibold tracking-[-0.01em] text-ink"
            >
              {blocked ? dict.consent.blockedTitle : dict.consent.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-body">
              {blocked ? dict.consent.blockedBody : dict.consent.body}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleDecline}
                disabled={busy}
                className="inline-flex h-11 items-center justify-center rounded-[6px] border border-hairline bg-elevated px-5 text-sm font-medium text-ink transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 sm:h-9"
              >
                {dict.consent.decline}
              </button>
              <button
                type="button"
                onClick={handleAllow}
                disabled={busy}
                autoFocus
                className="inline-flex h-11 items-center justify-center rounded-[6px] bg-ink px-6 text-sm font-medium text-on-ink transition-colors hover:bg-ink-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 disabled:opacity-70 sm:h-9"
              >
                {busy ? (
                  <Spinner label={dict.consent.allow} />
                ) : (
                  dict.consent.allow
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConsentContext.Provider>
  );
}