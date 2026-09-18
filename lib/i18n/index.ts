import { LOCALES, LOCALE_LABELS, dictionaries, type Dictionary, type Locale } from "./dictionaries";

export { LOCALES, LOCALE_LABELS, dictionaries, type Dictionary, type Locale };

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function tpl(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

// As-needed locale-prefix strategy: the default locale (English) lives at bare
// paths ([path]), every other locale keeps its /{locale} prefix.
export function localizedHref(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path === "" ? "/" : path;
  return `/${locale}${path}`;
}