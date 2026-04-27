"use server";

import { cookies } from "next/headers";

import { Locale, locales } from "@/i18n/request";

export async function setUserLocale(locale: string) {
  const store = await cookies();
  if (locales.includes(locale as Locale)) {
    store.set("NEXT_LOCALE", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
}
