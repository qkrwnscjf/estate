import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import "./globals.css";
import LastUpdatedBadge from "@/components/LastUpdatedBadge";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "자취방 전월세 시세 대시보드",
  description: "청년들을 위한 부동산 자취 원룸 정보 웹 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${fraunces.variable} ${nunito.variable}`}>
      <body className="font-sans">
        <header className="sticky top-4 z-40 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 mt-4">
          <div className="bg-white/70 backdrop-blur-md border border-border/50 shadow-soft rounded-full py-4 px-6 flex justify-between items-center">
            <h1 className="font-heading text-2xl text-primary font-semibold tracking-tight">
              Wabi Estate
            </h1>
            <LastUpdatedBadge />
          </div>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
