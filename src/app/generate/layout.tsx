import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://emberword.com';

export const metadata: Metadata = {
  title: 'Een herinnering vastleggen - Emberwords',
  description: 'Deel een bijzondere herinnering en ontdek welk onvertaalbaar woord erbij past',
  openGraph: {
    title: 'Een herinnering vastleggen',
    description: 'Deel een bijzondere herinnering en ontdek welk onvertaalbaar woord erbij past',
    type: 'website',
    locale: 'nl_NL',
    siteName: 'Emberwords',
    images: [
      {
        url: `${baseUrl}/api/og-generate`,
        width: 1200,
        height: 630,
        alt: 'Een herinnering vastleggen - Emberwords',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Een herinnering vastleggen',
    description: 'Deel een bijzondere herinnering en ontdek welk onvertaalbaar woord erbij past',
    images: [`${baseUrl}/api/og-generate`],
  },
};

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
