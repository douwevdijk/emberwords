'use client';

import { useState, useRef, useEffect, lazy, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, RotateCcw, Copy, PenLine, ArrowLeft, Camera, MapPin, Send, X, Loader2, Navigation, Search, Check, Share2 } from 'lucide-react';
import { WordCard } from '@/lib/types';
import { saveMemory } from '@/lib/memoryService';
import { uploadImage, generateMemoryImagePath } from '@/lib/storageService';
import { getCurrentPosition, getAddressFromCoords, LocationResult } from '@/lib/locationService';
import { getCountryFlag } from '@/lib/countryFlags';
import TwemojiFlag from '@/components/TwemojiFlag';
import Toast from '@/components/Toast';

const LocationMap = lazy(() => import('@/components/LocationMap'));
const PlacesAutocomplete = lazy(() => import('@/components/PlacesAutocomplete'));

type ViewState = 'front' | 'back' | 'memory' | 'success';

interface Props {
  card: WordCard;
}

export default function CardDetailClient({ card }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewState, setViewState] = useState<ViewState>('front');

  // Memory form state
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoadingMemory, setIsLoadingMemory] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewState]);

  const deepDive = card.deepDive || null;

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setShowToast(true);
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      setUploadProgress(0);
      setUploadedImageUrl(null);

      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 50)); // 0-50% for reading
        }
      };
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImage(base64);
        setUploadProgress(50);

        // Upload to Firebase Storage immediately
        const tempId = `${card.id}_${Date.now()}`;
        const imagePath = generateMemoryImagePath(tempId);
        const uploadedUrl = await uploadImage(base64, imagePath);

        if (uploadedUrl) {
          setUploadedImageUrl(uploadedUrl);
          setUploadProgress(100);
          setTimeout(() => {
            setIsUploadingImage(false);
            setUploadProgress(0);
          }, 300);
        } else {
          alert('Foto uploaden mislukt. Probeer opnieuw.');
          setImage(null);
          setIsUploadingImage(false);
          setUploadProgress(0);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Schrijf eerst je verhaal');
      return;
    }
    if (!location) {
      alert('Voeg een locatie toe');
      return;
    }
    if (image && !uploadedImageUrl) {
      alert('Wacht tot de foto is geüpload');
      return;
    }

    setIsSubmitting(true);
    try {
      const memoryId = await saveMemory({
        cardId: card.id,
        userName: name.trim(),
        text: text.trim(),
        userLocation: { lat: location.lat, lng: location.lng, name: location.name },
        mediaUrl: uploadedImageUrl || undefined,
        mediaType: uploadedImageUrl ? 'image' : 'none'
      });

      if (memoryId) {
        setViewState('success');
      } else {
        alert('Er ging iets mis bij het opslaan.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Er ging iets mis. Probeer opnieuw.');
      setIsSubmitting(false);
    }
  };

  const resetMemoryForm = () => {
    setName('');
    setText('');
    setImage(null);
    setUploadedImageUrl(null);
    setLocation(null);
    setIsSubmitting(false);
  };

  // CARD FLIP VIEW (front/back)
  if (viewState === 'front' || viewState === 'back') {
    const isFlipped = viewState === 'back';

    return (
      <div className="fixed inset-0 perspective-1000">
        <div
          onClick={() => setViewState(isFlipped ? 'front' : 'back')}
          className={`relative w-full h-full transform-style-3d flip-transition cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT - White */}
          <div className="absolute inset-0 backface-hidden bg-white overflow-auto">
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 px-4 py-3 flex justify-end items-center">
              <button
                onClick={(e) => { e.stopPropagation(); handleShare(); }}
                className="text-stone-500 text-sm flex items-center gap-2 hover:text-amber-500 transition-colors"
              >
                <Copy size={16} />
                Kopieer link
              </button>
            </div>
            <Toast message="Link gekopieerd!" isVisible={showToast} onClose={() => setShowToast(false)} />
            <div className="flex flex-col items-center justify-start pt-32 md:justify-center md:pt-0 min-h-[calc(100vh-57px)] p-8">
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-4">{card.country}</p>
              <h1 className="text-5xl font-serif text-stone-900 mb-2 text-center">{card.word}</h1>
              {card.pronunciation && (
                <p className="text-stone-400 text-sm italic mb-8">/{card.pronunciation}/</p>
              )}
              <div className="w-12 h-1 bg-amber-400 rounded-full mb-12"></div>
              <p className="text-stone-400 text-sm flex items-center gap-2">
                <RotateCcw size={16} />
                Tik om te draaien
              </p>
            </div>
          </div>

          {/* BACK - Dark */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-stone-900 text-white overflow-auto">
            <div className="sticky top-0 z-50 bg-stone-900/80 backdrop-blur-md border-b border-stone-800 px-4 py-4 flex justify-center items-center">
              <p className="text-stone-300 text-base flex items-center gap-2 font-medium">
                <RotateCcw size={18} />
                Tik om terug te draaien
              </p>
            </div>

            <div className="max-w-2xl mx-auto p-8">
              <div className="pb-6">
                <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">{card.country}</p>
                <h1 className="text-4xl font-serif mb-4">{card.word}</h1>
                <p className="text-stone-400 text-lg leading-relaxed font-serif italic">
                  &quot;{card.shortDefinition}&quot;
                </p>
              </div>

              <div className="py-6 border-t border-stone-800">
                <h3 className="font-serif text-xl mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-amber-500" />
                  De Diepte In
                </h3>
                {deepDive ? (
                  <div className="space-y-4 text-stone-400 leading-relaxed">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wide text-stone-600 mb-1">Culturele Context</h4>
                      <p>{deepDive.culturalContext}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wide text-stone-600 mb-1">Filosofie</h4>
                      <p className="italic border-l-2 border-amber-500 pl-3">{deepDive.philosophicalInsight}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wide text-stone-600 mb-1">Voorbeeld</h4>
                      <p className="bg-stone-800 p-3 rounded-lg text-sm">{deepDive.exampleUsage}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-stone-500 italic">Geen verdieping beschikbaar voor dit woord.</p>
                )}
              </div>

              <div className="py-6 border-t border-stone-800">
                <div className="bg-stone-800 p-4 rounded-lg border-l-4 border-amber-500 mb-6">
                  <p className="text-white font-medium">{card.question}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLoadingMemory(true);
                    setTimeout(() => {
                      setViewState('memory');
                      setIsLoadingMemory(false);
                    }, 100);
                  }}
                  disabled={isLoadingMemory}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg disabled:bg-amber-400"
                >
                  {isLoadingMemory ? <Loader2 size={20} className="animate-spin" /> : <PenLine size={20} />}
                  {isLoadingMemory ? 'Laden...' : 'Deel jouw verhaal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS
  if (viewState === 'success') {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-amber-50 to-white flex flex-col items-center justify-center p-6">
        <div className="mb-8 relative">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-once">
            <Check size={48} className="text-white" strokeWidth={3} />
          </div>
          <div className="absolute -inset-4 bg-green-500/20 rounded-full animate-ping-once"></div>
        </div>
        <h1 className="text-3xl font-serif text-stone-800 mb-2 text-center">Bedankt!</h1>
        <p className="text-stone-500 text-center mb-8 max-w-sm">
          Jouw verhaal is toegevoegd aan de wereldkaart van <span className="font-semibold">{card.word}</span>
        </p>
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-center border border-stone-100">
          <TwemojiFlag emoji={getCountryFlag(card.country)} className="text-3xl mb-2 block" />
          <h2 className="text-2xl font-serif text-stone-800">{card.word}</h2>
          <p className="text-sm text-stone-400">{card.country}</p>
        </div>
        <div className="flex items-center gap-2 text-stone-400 mb-8">
          <MapPin size={18} className="text-amber-500" />
          <span className="text-sm">Jouw locatie is toegevoegd aan de kaart</span>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => { resetMemoryForm(); setViewState('front'); }}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white py-4 rounded-xl font-bold transition-colors"
          >
            Terug naar {card.word}
          </button>
          <button
            onClick={() => router.push('/stories')}
            className="w-full bg-amber-100 text-amber-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-amber-200 transition-colors"
          >
            <MapPin size={18} />
            Bekijk alle verhalen
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full text-stone-500 hover:text-stone-700 py-2 text-sm transition-colors"
          >
            Ontdek meer woorden
          </button>
        </div>
      </div>
    );
  }

  // MEMORY FORM
  if (viewState === 'memory') {
    return (
      <div className="fixed inset-0 bg-stone-50 overflow-auto">
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewState('back')}
              className="text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1 w-20"
            >
              <ArrowLeft size={20} />
              <span className="text-sm">Terug</span>
            </button>
            <h1 className="font-serif text-xl text-stone-800">{card.word}</h1>
            <div className="w-20"></div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-stone-800 text-white p-4 rounded-xl mb-6 border-l-4 border-amber-500">
            <p className="text-sm font-medium">{card.question}</p>
          </div>

          {/* Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">Naam</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jouw naam"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
            />
          </div>

          {/* Text */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">Jouw verhaal</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Beschrijf een moment waarop je dit gevoel ervoer..."
              className="w-full h-40 p-4 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-stone-800"
            />
          </div>

          {/* Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">Foto (optioneel)</label>
            {isUploadingImage ? (
              <div className="w-full h-32 border-2 border-amber-300 bg-amber-50 rounded-xl flex flex-col items-center justify-center">
                <Loader2 size={32} className="text-amber-500 animate-spin mb-3" />
                <div className="w-32 h-2 bg-amber-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="text-sm text-amber-600 mt-2">{uploadProgress}%</span>
              </div>
            ) : image ? (
              <div className="relative">
                <img src={image} alt="Gekozen foto" className="w-full h-48 object-cover rounded-xl" />
                <button
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center text-stone-400 hover:border-amber-500 hover:text-amber-500 transition-colors"
              >
                <Camera size={32} className="mb-2" />
                <span className="text-sm">Voeg een foto toe</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </div>

          {/* Location */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-stone-700 mb-2">Waar was je?</label>
            {location ? (
              <div>
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <MapPin size={24} className="text-amber-500 flex-shrink-0" />
                  <span className="text-stone-800 font-medium flex-1">{location.name}</span>
                  <button onClick={() => setLocation(null)} className="text-stone-400 hover:text-stone-600 p-1">
                    <X size={20} />
                  </button>
                </div>
                <Suspense fallback={<div className="w-full h-48 rounded-xl bg-stone-100 mt-3 flex items-center justify-center"><Loader2 className="animate-spin text-stone-400" size={24} /></div>}>
                  <LocationMap lat={location.lat} lng={location.lng} name={location.name} />
                </Suspense>
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

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !text.trim() || !location}
            className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg mb-8"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <><Send size={20} />Verstuur</>}
          </button>
        </div>
      </div>
    );
  }

  // Fallback (should not reach here)
  return null;
}
