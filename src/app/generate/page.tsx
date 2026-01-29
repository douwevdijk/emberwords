'use client';

import { useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Gift, Loader2, MapPin, Navigation, Sparkles } from 'lucide-react';
import { generateGiftWord } from '@/lib/geminiService';
import { getCurrentPosition, getAddressFromCoords, LocationResult } from '@/lib/locationService';

const PlacesAutocomplete = lazy(() => import('@/components/PlacesAutocomplete'));

export default function GeneratePage() {
  const router = useRouter();
  const [forPerson, setForPerson] = useState('');
  const [memory, setMemory] = useState('');
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    try {
      const coords = await getCurrentPosition();
      const locationData = await getAddressFromCoords(coords.lat, coords.lng);
      if (locationData) {
        setLocation(locationData);
      } else {
        setLocation({ lat: coords.lat, lng: coords.lng, name: 'Locatie gevonden' });
      }
    } catch (error) {
      console.error('Location error:', error);
      alert('Kon locatie niet ophalen. Probeer handmatig te zoeken.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSelectSearchResult = (result: LocationResult) => {
    setLocation(result);
  };

  const handleGenerate = async () => {
    if (!forPerson.trim()) {
      alert('Vul een naam in');
      return;
    }
    if (!memory.trim()) {
      alert('Deel een herinnering');
      return;
    }
    if (!location) {
      alert('Kies een locatie');
      return;
    }

    setIsGenerating(true);

    const gift = await generateGiftWord(
      forPerson.trim(),
      memory.trim(),
      { lat: location.lat, lng: location.lng, name: location.name }
    );

    if (gift) {
      router.push(`/generate/${gift.id}`);
    } else {
      alert('Er ging iets mis. Probeer opnieuw.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-4">
        <div className="max-w-2xl mx-auto relative flex items-center justify-center">
          <Link href="/" className="absolute left-0 text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-2">
            <ArrowLeft size={20} />
            <span className="text-sm hidden sm:inline">Terug</span>
          </Link>
          <h1 className="font-serif text-xl text-stone-800">Maak een woordcadeau</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        {/* Intro */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift size={32} className="text-amber-600" />
          </div>
          <p className="text-stone-600">
            Geef iemand een onvertaalbaar woord dat bij een speciale herinnering past.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* For Person */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Voor wie is dit woord?
            </label>
            <input
              type="text"
              value={forPerson}
              onChange={(e) => setForPerson(e.target.value)}
              placeholder="Naam"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
            />
          </div>

          {/* Memory */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Deel een herinnering
            </label>
            <textarea
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              placeholder="Beschrijf een bijzonder moment met deze persoon..."
              className="w-full h-32 p-4 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-stone-800"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Waar was dit?
            </label>
            {location ? (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <MapPin size={24} className="text-amber-500 flex-shrink-0" />
                <span className="text-stone-800 font-medium flex-1">{location.name}</span>
                <button
                  onClick={() => setLocation(null)}
                  className="text-stone-400 hover:text-stone-600 text-sm"
                >
                  Wijzig
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Suspense fallback={<div className="flex items-center justify-center py-4"><Loader2 className="animate-spin text-amber-500" size={24} /></div>}>
                  <PlacesAutocomplete onSelect={handleSelectSearchResult} />
                </Suspense>
                <div className="relative flex items-center">
                  <div className="flex-1 h-px bg-stone-200"></div>
                  <span className="px-3 text-xs text-stone-400">of</span>
                  <div className="flex-1 h-px bg-stone-200"></div>
                </div>
                <button
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-stone-900 font-bold rounded-xl transition-colors"
                >
                  {isGettingLocation ? <Loader2 size={22} className="animate-spin" /> : <Navigation size={22} />}
                  <span>Gebruik mijn locatie</span>
                </button>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !forPerson.trim() || !memory.trim() || !location}
            className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg mt-8"
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Woord wordt gezocht...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Genereer woord
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
