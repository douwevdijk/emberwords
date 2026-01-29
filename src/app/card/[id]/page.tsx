import { Metadata } from 'next';
import { getWordById } from '@/lib/wordService';
import CardDetailClient from './CardDetailClient';

// Force dynamic rendering to ensure metadata is in initial HTML
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for Open Graph
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const card = await getWordById(id);

  if (!card) {
    return {
      title: 'Woord niet gevonden - Emberwords',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://emberword.com';
  const ogImageUrl = `${baseUrl}/api/og?word=${encodeURIComponent(card.word)}&country=${encodeURIComponent(card.country)}&definition=${encodeURIComponent(card.shortDefinition)}`;

  return {
    title: `${card.word} - Emberwords`,
    description: card.shortDefinition,
    openGraph: {
      title: card.word,
      description: card.shortDefinition,
      type: 'article',
      locale: 'nl_NL',
      siteName: 'Emberwords',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: card.word,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: card.word,
      description: card.shortDefinition,
      images: [ogImageUrl],
    },
  };
}

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  const card = await getWordById(id);

  if (!card) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-stone-800 mb-2">Woord niet gevonden</h1>
          <p className="text-stone-500">Dit woord bestaat niet of is verwijderd.</p>
        </div>
      </div>
    );
  }

  return <CardDetailClient key={id} card={card} />;
}
