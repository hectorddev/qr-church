import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./utils.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "El Pan de Vida",
  description: "Una Verdad para tu Vida",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#1a365d",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth h-full">
      <head>
        <Script
          src="https://cdn.tailwindcss.com"
          strategy="beforeInteractive"
        />
        <meta name="theme-color" content="#1a365d" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <div className="h-full w-full">
          <main className="h-full w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
