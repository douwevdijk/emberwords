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

export const metadata: Metadata = {
  title: "Emberwords",
  description: "Ontdek woorden die gevoelens beschrijven waar wij geen naam voor hebben.",
  openGraph: {
    title: "Emberwords",
    description: "Ontdek woorden die gevoelens beschrijven waar wij geen naam voor hebben.",
    type: "website",
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
