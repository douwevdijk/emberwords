import { Metadata } from 'next';
import { getGiftById } from '@/lib/giftService';
import GiftDetailClient from './GiftDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for Open Graph
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const gift = await getGiftById(id);

  if (!gift) {
    return {
      title: 'Cadeau niet gevonden - Emberwords',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://emberwords.vercel.app';
  const ogImageUrl = `${baseUrl}/api/og-gift?word=${encodeURIComponent(gift.word)}&country=${encodeURIComponent(gift.country)}&withPerson=${encodeURIComponent(gift.withPerson)}&meaning=${encodeURIComponent(gift.meaning)}`;

  return {
    title: `${gift.word} - Een herinnering met ${gift.withPerson}`,
    description: gift.meaning,
    openGraph: {
      title: `${gift.word} - Met ${gift.withPerson}`,
      description: gift.meaning,
      type: 'article',
      locale: 'nl_NL',
      siteName: 'Emberwords',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${gift.word} - Een herinnering met ${gift.withPerson}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${gift.word} - Met ${gift.withPerson}`,
      description: gift.meaning,
      images: [ogImageUrl],
    },
  };
}

export default async function GiftPage({ params }: Props) {
  const { id } = await params;
  const gift = await getGiftById(id);

  if (!gift) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-stone-800 mb-2">Cadeau niet gevonden</h1>
          <p className="text-stone-500">Dit woordcadeau bestaat niet of is verwijderd.</p>
        </div>
      </div>
    );
  }

  return <GiftDetailClient gift={gift} />;
}
