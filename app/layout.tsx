import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./components/Navbar";
import { ScrollToTop } from "./components/ScrollToTop";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZapasYA",
  description: "Seguimiento de envíos",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        </head>
        <body className="min-h-full flex flex-col" style={{ width: "100%" }}>
          <ScrollToTop />
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}