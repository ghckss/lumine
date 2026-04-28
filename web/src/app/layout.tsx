import "./globals.css";
import type { Metadata } from "next";
import { AppProviders } from "@/providers/app-providers";
import { AuthGate } from "@/shared/components/auth-gate";

export const metadata: Metadata = {
  title: "Melancholy",
  description: "마음 상태 확인과 감정 일기"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AppProviders>
          <AuthGate>{children}</AuthGate>
        </AppProviders>
      </body>
    </html>
  );
}
