'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Flame, Loader2, MapPin, Navigation, Sparkles, RefreshCw, Share2, Copy, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Person, Gift } from '@/lib/types';
import { verifyAdminToken } from '@/lib/personService';
import { saveGift, getGiftsByPersonId, toggleGiftHidden, deleteGift } from '@/lib/giftService';
import { getCurrentPosition, getAddressFromCoords, LocationResult } from '@/lib/locationService';
import { getCountryFlag } from '@/lib/countryFlags';
import TwemojiFlag from '@/components/TwemojiFlag';
import Toast from '@/components/Toast';

const PlacesAutocomplete = dynamic(() => import('@/components/PlacesAutocomplete'), { ssr: false });

type ViewState = 'list' | 'form' | 'preview';

interface Props {
  person: Person;
  adminToken?: string;
}

export default function PersonPageClient({ person, adminToken }: Props) {
  const router = useRouter();

  const [viewState, setViewState] = useState<ViewState>('list');
  const [isAdmin, setIsAdmin] = useState(false);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(true);

  // Form state
  const [authorName, setAuthorName] = useState('');
  const [memory, setMemory] = useState('');
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [generatedGift, setGeneratedGift] = useState<Omit<Gift, 'id' | 'timestamp'> | null>(null);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Navigation loading state
  const [navigatingToGift, setNavigatingToGift] = useState<string | null>(null);

  // Check admin token and load gifts
  useEffect(() => {
    const init = async () => {
      if (adminToken) {
        const valid = await verifyAdminToken(person.id, adminToken);
        setIsAdmin(valid);
      }

      const giftsData = await getGiftsByPersonId(person.id, !!adminToken);
      setGifts(giftsData);
      setLoadingGifts(false);
    };
    init();
  }, [person.id, adminToken]);

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
    if (!authorName.trim()) {
      alert('Vul je naam in');
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

    const response = await fetch('/api/generate-word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        withPerson: person.name,
        memory: memory.trim(),
        location: { lat: location.lat, lng: location.lng, name: location.name }
      }),
    });
    const result = response.ok ? await response.json() : null;

    if (result) {
      setGeneratedGift({ ...result, personId: person.id, authorName: authorName.trim() });
      setViewState('preview');
      setTimeout(() => {
        document.querySelector('.overflow-auto')?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      alert('Er ging iets mis. Probeer opnieuw.');
    }
    setIsGenerating(false);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    const response = await fetch('/api/generate-word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        withPerson: person.name,
        memory: memory.trim(),
        location: { lat: location!.lat, lng: location!.lng, name: location!.name }
      }),
    });
    const result = response.ok ? await response.json() : null;

    if (result) {
      setGeneratedGift({ ...result, personId: person.id, authorName: authorName.trim() });
      setTimeout(() => {
        document.querySelector('.overflow-auto')?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      alert('Er ging iets mis. Probeer opnieuw.');
    }
    setIsGenerating(false);
  };

  const handleSave = async () => {
    if (!generatedGift) return;

    setIsSaving(true);
    const giftId = await saveGift(generatedGift as Gift);

    if (giftId) {
      // Redirect to the shareable gift page
      router.push(`/generate/${giftId}`);
    } else {
      alert('Er ging iets mis bij het opslaan. Probeer opnieuw.');
      setIsSaving(false);
    }
  };

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/create/${person.id}`;
    await navigator.clipboard.writeText(url);
    showToastMessage('Link gekopieerd!');
  }, [person.id]);

  const handleToggleHidden = async (giftId: string, currentHidden: boolean) => {
    const success = await toggleGiftHidden(giftId, !currentHidden);
    if (success) {
      setGifts(gifts.map(g => g.id === giftId ? { ...g, hidden: !currentHidden } : g));
    }
  };

  const handleDelete = async (giftId: string) => {
    if (!confirm('Weet je zeker dat je deze herinnering wilt verwijderen?')) return;

    const success = await deleteGift(giftId);
    if (success) {
      setGifts(gifts.filter(g => g.id !== giftId));
      showToastMessage('Herinnering verwijderd');
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  // LIST VIEW - Show person and memories
  if (viewState === 'list') {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-amber-50 to-white overflow-auto">
        <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />

        <div className="flex flex-col items-center justify-start pt-8 lg:pt-16 min-h-screen p-6 lg:p-12">
          <div className="w-full max-w-6xl">
            {/* Person Header */}
            <div className="text-center mb-8 lg:mb-12">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame size={40} className="text-amber-600 lg:hidden" />
                <Flame size={48} className="text-amber-600 hidden lg:block" />
              </div>
              <h1 className="font-serif text-3xl lg:text-5xl text-stone-800 mb-2">{person.name}</h1>
              {person.description && (
                <p className="text-stone-600 lg:text-lg">{person.description}</p>
              )}
              {isAdmin && (
                <div className="mt-2 inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                  Beheermodus
                </div>
              )}
            </div>

            {/* Action Buttons - side by side on desktop */}
            <div className="flex flex-col lg:flex-row gap-4 lg:justify-center lg:max-w-2xl lg:mx-auto mb-8 lg:mb-12">
              <button
                onClick={handleShare}
                className="w-full lg:w-auto lg:px-8 bg-stone-900 hover:bg-stone-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg"
              >
                <Copy size={20} />
                Kopieer link om te delen
              </button>

              <button
                onClick={() => setViewState('form')}
                className="w-full lg:w-auto lg:px-8 bg-amber-500 hover:bg-amber-600 text-stone-900 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors"
              >
                <Sparkles size={20} />
                Deel een herinnering
              </button>
            </div>

            {/* Memories Grid */}
            <div>
              <h2 className="font-serif text-xl lg:text-2xl text-stone-800 mb-4 lg:mb-6 text-center">
                Herinneringen ({gifts.length})
              </h2>

              {loadingGifts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-stone-400" size={32} />
                </div>
              ) : gifts.length === 0 ? (
                <div className="text-center py-8 lg:py-16 text-stone-500">
                  <p className="lg:text-lg">Nog geen herinneringen.</p>
                  <p className="text-sm lg:text-base mt-1">Deel de link en verzamel samen herinneringen!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gifts.map((gift) => (
                    <div
                      key={gift.id}
                      className={`group relative ${gift.hidden ? 'opacity-50' : ''}`}
                    >
                      <a
                        href={`/generate/${gift.id}`}
                        onClick={() => setNavigatingToGift(gift.id)}
                        className="block bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 lg:p-8 border border-stone-100 cursor-pointer"
                      >
                        {/* Author name */}
                        {gift.authorName && (
                          <p className="text-stone-400 text-sm text-center mb-3">
                            Door {gift.authorName}
                          </p>
                        )}

                        {/* Word */}
                        <h3 className="text-3xl lg:text-4xl font-serif text-stone-900 mb-2 text-center hover:text-amber-600 transition-colors">{gift.word}</h3>

                        {/* Translation */}
                        <p className="text-amber-600 text-base lg:text-lg text-center mb-4 lg:mb-6">{gift.translation}</p>

                        {/* Divider */}
                        <div className="w-10 h-1 bg-amber-400 rounded-full mx-auto mb-4 lg:mb-6"></div>

                        {/* Meaning - truncated to ~150 chars */}
                        <p className="text-stone-600 text-sm lg:text-base leading-relaxed text-center font-serif italic mb-4">
                          &quot;{gift.meaning.length > 150 ? gift.meaning.slice(0, 147) + '...' : gift.meaning}&quot;
                        </p>

                        {/* CTA */}
                        <p className="text-amber-600 text-sm text-center font-medium flex items-center justify-center gap-2">
                          {navigatingToGift === gift.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Laden...
                            </>
                          ) : (
                            'Bekijk herinnering →'
                          )}
                        </p>
                      </a>

                      {/* Admin controls overlay */}
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleHidden(gift.id, !!gift.hidden)}
                            className="p-2 bg-white/90 rounded-full text-stone-400 hover:text-stone-700 shadow-sm"
                          >
                            {gift.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button
                            onClick={() => handleDelete(gift.id)}
                            className="p-2 bg-white/90 rounded-full text-stone-400 hover:text-red-500 shadow-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FORM VIEW - Add a memory
  if (viewState === 'form') {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-amber-50 to-white overflow-auto">
        {/* Loading Overlay */}
        {isGenerating && (
          <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Sparkles size={40} className="text-amber-600" />
            </div>
            <h2 className="font-serif text-2xl text-stone-800 mb-2">Even geduld...</h2>
            <p className="text-stone-500 text-center max-w-xs">
              We zoeken het perfecte woord voor jouw herinnering. Dit kan een minuutje duren.
            </p>
            <div className="mt-6 flex gap-1">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col items-center justify-start pt-12 md:justify-center md:pt-0 min-h-screen p-6">
          {/* Person Name Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-amber-600" />
            </div>
            <h1 className="font-serif text-2xl text-stone-800 mb-2">
              Herinnering met {person.name}
            </h1>
            <p className="text-stone-600">
              Deel een bijzondere herinnering en ontdek welk woord erbij past.
            </p>
          </div>

          {/* Form */}
          <div className="w-full max-w-md space-y-6">
            {/* Author Name */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Jouw naam
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Hoe heet jij?"
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

            {/* Buttons */}
            <div className="space-y-3 mt-8">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !authorName.trim() || !memory.trim() || !location}
                className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg"
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

              <button
                onClick={() => setViewState('list')}
                className="w-full text-stone-500 hover:text-stone-700 py-2 text-sm"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PREVIEW VIEW - Show generated word
  if (viewState === 'preview' && generatedGift) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-amber-50 to-white overflow-auto">
        {/* Loading Overlay */}
        {isGenerating && (
          <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Sparkles size={40} className="text-amber-600 lg:hidden" />
              <Sparkles size={48} className="text-amber-600 hidden lg:block" />
            </div>
            <h2 className="font-serif text-2xl lg:text-3xl text-stone-800 mb-2">Even geduld...</h2>
            <p className="text-stone-500 text-center max-w-xs lg:text-lg">
              We zoeken een nieuw woord voor jouw herinnering. Dit kan een minuutje duren.
            </p>
            <div className="mt-6 flex gap-1">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col items-center justify-start pt-8 lg:pt-16 min-h-screen p-6 lg:p-12 overflow-auto">
          <div className="w-full max-w-lg lg:max-w-2xl">
            {/* Word Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 mb-6 lg:mb-10 border border-stone-100">
              {/* Flag & Country */}
              <div className="flex items-center justify-center gap-2 mb-4 lg:mb-6">
                <TwemojiFlag emoji={getCountryFlag(generatedGift.country)} className="text-2xl lg:text-3xl" />
                <span className="text-xs lg:text-sm uppercase tracking-widest text-stone-400">{generatedGift.country}</span>
              </div>

              {/* Word */}
              <h1 className="text-5xl lg:text-7xl font-serif text-stone-900 text-center mb-2 lg:mb-4">{generatedGift.word}</h1>

              {/* Translation */}
              <p className="text-amber-600 text-lg lg:text-2xl text-center mb-1 lg:mb-2">{generatedGift.translation}</p>

              {/* Pronunciation */}
              {generatedGift.pronunciation && (
                <p className="text-stone-400 text-sm lg:text-base italic text-center mb-4 lg:mb-6">/{generatedGift.pronunciation}/</p>
              )}

              {/* Explanation */}
              <p className="text-stone-500 text-sm lg:text-base text-center mb-6 lg:mb-8">
                {generatedGift.explanation}
              </p>

              {/* Divider */}
              <div className="w-12 lg:w-16 h-1 bg-amber-400 rounded-full mx-auto mb-6 lg:mb-8"></div>

              {/* Meaning */}
              <p className="text-stone-600 text-lg lg:text-xl leading-relaxed text-center font-serif italic">
                &quot;{generatedGift.meaning}&quot;
              </p>
            </div>

            {/* Poem Section */}
            <div className="bg-amber-50 rounded-2xl p-6 lg:p-10 mb-8 lg:mb-10 border border-amber-100">
              <p className="text-stone-700 lg:text-lg leading-relaxed font-serif italic text-center whitespace-pre-line">
                {generatedGift.poem}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col lg:flex-row lg:justify-center gap-3 lg:gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full lg:w-auto lg:px-12 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Share2 size={20} />
                    Bewaar herinnering
                  </>
                )}
              </button>

              <button
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="w-full lg:w-auto lg:px-8 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 py-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-colors"
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
      </div>
    );
  }

  return null;
}
