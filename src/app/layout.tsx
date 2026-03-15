import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";

// Noto Sans KR — 한국어 서비스 기본 폰트
// subsets: 'latin'만 지원하지만 한국어 글리프는 Google Fonts 측에서 자동으로 포함됨
// display: 'swap' — FOUT 방식으로 레이아웃 시프트를 최소화
const notoSansKR = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tag Me",
  description: "태그 기반 소셜 일기 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} antialiased`}>
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
