import type { Metadata } from "next";
import "./globals.css";
import { Iceland } from "next/font/google";

const iceland = Iceland({
  variable: "--font-iceland",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Infinite Wordle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased ${iceland.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
