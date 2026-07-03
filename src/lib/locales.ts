export const localeCodes = ["en", "ru", "kk"] as const;
export type LocaleCode = (typeof localeCodes)[number];

export const defaultLocale: LocaleCode = "en";

export const localeLabels: Record<LocaleCode, string> = {
  en: "English",
  ru: "Русский",
  kk: "Қазақша"
};

export function isLocaleCode(value: string | undefined): value is LocaleCode {
  return localeCodes.includes(value as LocaleCode);
}

export function localizedPath(locale: LocaleCode, path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalizedPath === "/" ? "/" : normalizedPath}`;
}

