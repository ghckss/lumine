import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { AuthGate } from "@/shared/components/AuthGate";
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
          <AuthGate>
            <div className="min-h-screen bg-background">
              <AppHeader />
              <div className="pt-16">{children}</div>
            </div>
          </AuthGate>
        </AppProviders>
      </body>
    </html>
  );
}
