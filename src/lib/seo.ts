import { localeCodes, localizedPath, type LocaleCode } from "./locales";

export type LocaleAlternate = {
  locale: LocaleCode;
  href: string;
  hrefLang: string;
};

export const siteUrl = "https://uyren.netlify.app";
export const defaultSocialImage = "/media/social/uyren-og.svg";

export function getCanonicalUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteUrl).toString();
}

export function getLocalizedAlternates(path = "/"): LocaleAlternate[] {
  return localeCodes.map((locale) => ({
    locale,
    href: getCanonicalUrl(localizedPath(locale, path)),
    hrefLang: locale
  }));
}
