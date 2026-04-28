import { GoogleAnalytics } from "@next/third-parties/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import localFont from "next/font/local";

import { ThemeProvider } from "@/components/providers/ThemeProvider";

import type { Metadata } from "next";

import "./globals.css";

import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

const pretendard = localFont({
  src: "./PretendardJPVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "MidnightSky✨",
  description: "MidnightSky✨",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${pretendard.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-linear-to-br from-violet-600 from-50% to-indigo-950 antialiased">
        <GoogleAnalytics gaId="G-CGQLM25K79" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>{children}</QueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
