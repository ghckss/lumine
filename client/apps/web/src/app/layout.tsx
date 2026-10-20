import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/AppProviders";
import { AppShell } from "@/components/AppShell";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lumine-mind-journal.cozyhero128.chatgpt.site"),
  title: "Lumine · 마음의 빛을 기록해요",
  description: "감정을 기록하고 마음의 흐름을 천천히 돌아보는 조용한 공간, Lumine",
  applicationName: "Lumine",
  openGraph: {
    title: "Lumine · 마음의 빛을 기록해요",
    description: "감정을 기록하고 마음의 흐름을 천천히 돌아보는 조용한 공간",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    title: "Lumine · 마음의 빛을 기록해요",
    description: "감정을 기록하고 마음의 흐름을 천천히 돌아보는 조용한 공간",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f3ff",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
