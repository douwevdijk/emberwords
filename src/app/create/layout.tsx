import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://emberwords.com';
const ogImageUrl = `${baseUrl}/api/og-person?name=Herinneringen&description=Maak%20een%20pagina%20aan%20en%20verzamel%20samen%20herinneringen&count=0`;

export const metadata: Metadata = {
  title: 'Herinneringen verzamelen - Emberwords',
  description: 'Maak een pagina aan voor iemand en verzamel samen herinneringen. Elk verhaal wordt omgezet in een uniek woord.',
  openGraph: {
    title: 'Herinneringen verzamelen',
    description: 'Maak een pagina aan voor iemand en verzamel samen herinneringen. Elk verhaal wordt omgezet in een uniek woord.',
    type: 'website',
    locale: 'nl_NL',
    siteName: 'Emberwords',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Herinneringen verzamelen - Emberwords',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Herinneringen verzamelen',
    description: 'Maak een pagina aan voor iemand en verzamel samen herinneringen. Elk verhaal wordt omgezet in een uniek woord.',
    images: [ogImageUrl],
  },
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
