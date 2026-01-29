import { Metadata } from 'next';
import { getPersonById } from '@/lib/personService';
import PersonPageClient from './PersonPageClient';

interface Props {
  params: Promise<{ id: string }>;
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

  return {
    title: `Herinneringen voor ${person.name} - Emberwords`,
    description: person.description || `Deel jouw herinneringen met ${person.name}`,
    openGraph: {
      title: `Herinneringen voor ${person.name}`,
      description: person.description || `Deel jouw herinneringen met ${person.name}`,
      type: 'article',
      locale: 'nl_NL',
      siteName: 'Emberwords',
    },
  };
}

export default async function PersonPage({ params }: Props) {
  const { id } = await params;
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

  return <PersonPageClient person={person} />;
}
