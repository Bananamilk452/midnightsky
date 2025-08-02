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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-linear-to-br from-violet-600 from-50% to-indigo-950 antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
