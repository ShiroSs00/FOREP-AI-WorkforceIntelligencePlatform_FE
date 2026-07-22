import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { GoogleAnalytics } from "@next/third-parties/google";

const appFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-app",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FOREP EXE",
  description: "Nền tảng quản lý công việc, mức tải công việc và báo cáo ngày cho doanh nghiệp nhỏ.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body className={appFont.variable}>
        <Providers>{children}</Providers>
      </body>
      <GoogleAnalytics gaId="G-4E9Q8VEV2T" />
    </html>
  );
}
