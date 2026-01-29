'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Gift, MapPin, Share2, Sparkles } from 'lucide-react';
import { Gift as GiftType } from '@/lib/types';
import { getCountryFlag } from '@/lib/countryFlags';
import TwemojiFlag from '@/components/TwemojiFlag';
import Toast from '@/components/Toast';

interface Props {
  gift: GiftType;
}

export default function GiftDetailClient({ gift }: Props) {
  const [showToast, setShowToast] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${gift.word} - Een woord voor ${gift.forPerson}`,
          text: gift.meaning,
          url: url,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall back to copy
      }
    }

    await navigator.clipboard.writeText(url);
    setShowToast(true);
  }, [gift]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Toast message="Link gekopieerd!" isVisible={showToast} onClose={() => setShowToast(false)} />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-4">
        <div className="max-w-2xl mx-auto relative flex items-center justify-center">
          <Link href="/generate" className="absolute left-0 text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-2">
            <ArrowLeft size={20} />
            <span className="text-sm hidden sm:inline">Nieuw woord</span>
          </Link>
          <div className="flex items-center gap-2">
            <Gift size={20} className="text-amber-500" />
            <span className="text-sm text-stone-600">Woordcadeau</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        {/* For Person Badge */}
        <div className="text-center mb-2">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
            <Sparkles size={16} />
            Voor {gift.forPerson}
          </span>
        </div>

        {/* Word Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-stone-100">
          {/* Flag & Country */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <TwemojiFlag emoji={getCountryFlag(gift.country)} className="text-2xl" />
            <span className="text-xs uppercase tracking-widest text-stone-400">{gift.country}</span>
          </div>

          {/* Word */}
          <h1 className="text-5xl font-serif text-stone-900 text-center mb-2">{gift.word}</h1>

          {/* Pronunciation */}
          {gift.pronunciation && (
            <p className="text-stone-400 text-sm italic text-center mb-6">/{gift.pronunciation}/</p>
          )}

          {/* Divider */}
          <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mb-6"></div>

          {/* Meaning */}
          <p className="text-stone-600 text-lg leading-relaxed text-center font-serif italic">
            &quot;{gift.meaning}&quot;
          </p>
        </div>

        {/* Memory Section */}
        <div className="bg-stone-50 rounded-2xl p-6 mb-6 border border-stone-100">
          <h3 className="text-xs uppercase tracking-widest text-stone-400 mb-3">De herinnering</h3>
          <p className="text-stone-700 leading-relaxed">{gift.memory}</p>

          {/* Location */}
          <div className="flex items-center gap-2 mt-4 text-stone-500 text-sm">
            <MapPin size={16} className="text-amber-500" />
            <span>{gift.location.name}</span>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full bg-stone-900 hover:bg-stone-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg"
        >
          <Share2 size={20} />
          Deel dit woord
        </button>

        {/* Create Your Own */}
        <div className="text-center mt-8 pt-6 border-t border-stone-200">
          <p className="text-stone-500 text-sm mb-3">Wil je ook een woord cadeau geven?</p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            <Gift size={18} />
            Maak je eigen woordcadeau
          </Link>
        </div>
      </div>
    </div>
  );
}
