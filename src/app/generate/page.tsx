'use client';

import { useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Loader2, MapPin, Navigation, Sparkles, RefreshCw, Share2 } from 'lucide-react';
import { generateGiftWord } from '@/lib/geminiService';
import { saveGift } from '@/lib/giftService';
import { Gift } from '@/lib/types';
import { getCurrentPosition, getAddressFromCoords, LocationResult } from '@/lib/locationService';
import { getCountryFlag } from '@/lib/countryFlags';
import TwemojiFlag from '@/components/TwemojiFlag';

const PlacesAutocomplete = lazy(() => import('@/components/PlacesAutocomplete'));

type ViewState = 'form' | 'preview';

export default function GeneratePage() {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>('form');
  const [withPerson, setWithPerson] = useState('');
  const [memory, setMemory] = useState('');
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [generatedGift, setGeneratedGift] = useState<Omit<Gift, 'id' | 'timestamp'> | null>(null);

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
    if (!withPerson.trim()) {
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

    const result = await generateGiftWord(
      withPerson.trim(),
      memory.trim(),
      { lat: location.lat, lng: location.lng, name: location.name }
    );

    if (result) {
      setGeneratedGift(result);
      setViewState('preview');
    } else {
      alert('Er ging iets mis. Probeer opnieuw.');
    }
    setIsGenerating(false);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    const result = await generateGiftWord(
      withPerson.trim(),
      memory.trim(),
      { lat: location!.lat, lng: location!.lng, name: location!.name }
    );

    if (result) {
      setGeneratedGift(result);
    } else {
      alert('Er ging iets mis. Probeer opnieuw.');
    }
    setIsGenerating(false);
  };

  const handleSaveAndShare = async () => {
    if (!generatedGift) return;

    setIsSaving(true);
    const giftId = await saveGift(generatedGift as Gift);

    if (giftId) {
      router.push(`/generate/${giftId}`);
    } else {
      alert('Er ging iets mis bij het opslaan. Probeer opnieuw.');
      setIsSaving(false);
    }
  };

  // FORM VIEW
  if (viewState === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-center">
            <h1 className="font-serif text-xl text-stone-800">Een herinnering vastleggen</h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto p-6">
          {/* Intro */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-amber-600" />
            </div>
            <p className="text-stone-600">
              Deel een bijzondere herinnering en ontdek welk onvertaalbaar woord erbij past.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* With Person */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Met wie is deze herinnering?
              </label>
              <input
                type="text"
                value={withPerson}
                onChange={(e) => setWithPerson(e.target.value)}
                placeholder="Naam"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
              />
            </div>

            {/* Memory */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Deel je herinnering
              </label>
              <textarea
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                placeholder="Beschrijf een bijzonder moment..."
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
              disabled={isGenerating || !withPerson.trim() || !memory.trim() || !location}
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
                  Ontdek het woord
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PREVIEW VIEW
  if (viewState === 'preview' && generatedGift) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-center">
            <span className="text-sm text-stone-500">Preview</span>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto p-6">
          {/* Word Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-stone-100">
            {/* Flag & Country */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <TwemojiFlag emoji={getCountryFlag(generatedGift.country)} className="text-2xl" />
              <span className="text-xs uppercase tracking-widest text-stone-400">{generatedGift.country}</span>
            </div>

            {/* Word */}
            <h1 className="text-5xl font-serif text-stone-900 text-center mb-2">{generatedGift.word}</h1>

            {/* Translation */}
            <p className="text-amber-600 text-lg text-center mb-1">{generatedGift.translation}</p>

            {/* Pronunciation */}
            {generatedGift.pronunciation && (
              <p className="text-stone-400 text-sm italic text-center mb-4">/{generatedGift.pronunciation}/</p>
            )}

            {/* Explanation */}
            <p className="text-stone-500 text-sm text-center mb-6 max-w-md mx-auto">
              {generatedGift.explanation}
            </p>

            {/* Divider */}
            <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mb-6"></div>

            {/* Meaning */}
            <p className="text-stone-600 text-lg leading-relaxed text-center font-serif italic">
              &quot;{generatedGift.meaning}&quot;
            </p>
          </div>

          {/* Poem Section */}
          <div className="bg-amber-50 rounded-2xl p-6 mb-8 border border-amber-100">
            <p className="text-stone-700 leading-relaxed font-serif italic text-center whitespace-pre-line">
              {generatedGift.poem}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSaveAndShare}
              disabled={isSaving}
              className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg"
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Opslaan...
                </>
              ) : (
                <>
                  <Share2 size={20} />
                  Bewaar en deel
                </>
              )}
            </button>

            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="w-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 py-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Nieuw woord zoeken...
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  Probeer een ander woord
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
