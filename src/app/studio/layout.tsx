import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://emberword.com';

export const metadata: Metadata = {
  title: 'Studio - Emberwords',
  description: 'Discover unique, untranslatable words from cultures around the world',
  openGraph: {
    title: 'Emberwords Studio',
    description: 'Discover unique, untranslatable words from cultures around the world',
    type: 'website',
    locale: 'en_US',
    siteName: 'Emberwords',
    images: [
      {
        url: `${baseUrl}/api/og?word=Emberwords&definition=Discover unique, untranslatable words from cultures around the world`,
        width: 1200,
        height: 630,
        alt: 'Emberwords Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emberwords Studio',
    description: 'Discover unique, untranslatable words from cultures around the world',
    images: [`${baseUrl}/api/og?word=Emberwords&definition=Discover unique, untranslatable words from cultures around the world`],
  },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
