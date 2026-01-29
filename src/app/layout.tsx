import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://emberword.com';

export const metadata: Metadata = {
  title: "Emberwords",
  description: "Ontdek woorden die gevoelens beschrijven waar wij geen naam voor hebben.",
  openGraph: {
    title: "Emberwords",
    description: "Ontdek woorden die gevoelens beschrijven waar wij geen naam voor hebben.",
    type: "website",
    locale: "nl_NL",
    siteName: "Emberwords",
    images: [
      {
        url: `${baseUrl}/api/og-person?name=Emberwords&description=Ontdek%20woorden%20die%20gevoelens%20beschrijven&count=0`,
        width: 1200,
        height: 630,
        alt: "Emberwords",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emberwords",
    description: "Ontdek woorden die gevoelens beschrijven waar wij geen naam voor hebben.",
    images: [`${baseUrl}/api/og-person?name=Emberwords&description=Ontdek%20woorden%20die%20gevoelens%20beschrijven&count=0`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${playfair.variable} ${inter.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
