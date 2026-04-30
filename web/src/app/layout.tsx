import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { AppHeader } from "@/shared/components/AppHeader";

const appFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Lumine",
  description: "lumis eterne - 당신의 영원한 빛"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
      </head>
      <body className={`${appFont.variable}`}>
        <AppProviders>
          <div className="relative min-h-screen overflow-x-hidden bg-background">
            <div
              className="pointer-events-none fixed inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/screening-start-bg.png')" }}
            />
            <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(250,248,255,0.72),rgba(250,248,255,0.88))]" />
            <AppHeader />
            <div className="relative z-10 pt-16">{children}</div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
