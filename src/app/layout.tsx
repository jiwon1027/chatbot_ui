import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chat bot",
  description: "나이스페이먼츠 가맹점을 위한 고객지원 챗봇",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
