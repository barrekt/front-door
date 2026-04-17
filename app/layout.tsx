import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Nav } from "@/components/layout/Nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevOps Front Door",
  description: "Single entry point for DevOps team requests",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-neutral-50">
        <Nav />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
