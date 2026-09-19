import type { Locale } from "../dictionaries";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { ja } from "./ja";
import { de } from "./de";
import { pt } from "./pt";
import { ko } from "./ko";
import { it } from "./it";
import type { PageContent } from "./types";

export type { PageContent, PageSection } from "./types";

export const pageContent: Record<Locale, PageContent> = {
  en,
  es,
  ja,
  fr,
  de,
  pt,
  ko,
  it,
};

export function getPageContent(locale: Locale): PageContent {
  return pageContent[locale];
}