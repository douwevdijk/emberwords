import { Metadata } from 'next';
import { getWordById } from '@/lib/wordService';
import WordDetailClient from './WordDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const card = await getWordById(id);

  if (!card) {
    return {
      title: 'Word not found - Emberwords',
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
      locale: 'en_US',
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

export default async function WordPage({ params }: Props) {
  const { id } = await params;
  const card = await getWordById(id);

  if (!card) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-stone-800 mb-2">Word not found</h1>
          <p className="text-stone-500">This word does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return <WordDetailClient key={id} card={card} />;
}
