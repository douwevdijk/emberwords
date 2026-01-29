import { Metadata } from 'next';
import { getPersonById } from '@/lib/personService';
import { getGiftsByPersonId } from '@/lib/giftService';
import PersonPageClient from './PersonPageClient';

// Force dynamic rendering to ensure metadata is in initial HTML
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ beheer?: string }>;
}

// Generate dynamic metadata for Open Graph
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const person = await getPersonById(id);

  if (!person) {
    return {
      title: 'Pagina niet gevonden - Emberwords',
    };
  }

  // Get count of memories for this person
  const gifts = await getGiftsByPersonId(id, false);
  const count = gifts.length;

  // Build OG image URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://emberword.com';
  const ogImageUrl = `${baseUrl}/api/og-person?name=${encodeURIComponent(person.name)}&description=${encodeURIComponent(person.description || '')}&count=${count}`;

  return {
    title: `Herinneringen voor ${person.name} - Emberwords`,
    description: person.description || `Deel jouw herinneringen met ${person.name}`,
    openGraph: {
      title: `Herinneringen voor ${person.name}`,
      description: person.description || `Deel jouw herinneringen met ${person.name}`,
      type: 'article',
      locale: 'nl_NL',
      siteName: 'Emberwords',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Herinneringen voor ${person.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Herinneringen voor ${person.name}`,
      description: person.description || `Deel jouw herinneringen met ${person.name}`,
      images: [ogImageUrl],
    },
  };
}

export default async function PersonPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { beheer } = await searchParams;
  const person = await getPersonById(id);

  if (!person) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-stone-800 mb-2">Pagina niet gevonden</h1>
          <p className="text-stone-500">Deze persoonspagina bestaat niet of is verwijderd.</p>
        </div>
      </div>
    );
  }

  return <PersonPageClient person={person} adminToken={beheer} />;
}
