'use client';

import { useState, useCallback } from 'react';
import { Copy } from 'lucide-react';
import { Gift } from '@/lib/types';
import { getCountryFlag } from '@/lib/countryFlags';
import TwemojiFlag from '@/components/TwemojiFlag';
import Toast from '@/components/Toast';

interface Props {
  gift: Gift;
}

export default function GiftDetailClient({ gift }: Props) {
  const [showToast, setShowToast] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setShowToast(true);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-amber-50 to-white overflow-auto">
      <Toast message="Link gekopieerd!" isVisible={showToast} onClose={() => setShowToast(false)} />

      {/* Content */}
      <div className="flex flex-col items-center justify-start pt-8 md:justify-center md:pt-0 min-h-screen p-6">
        <div className="w-full max-w-lg">
          {/* Word Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-stone-100">
            {/* Flag & Country */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <TwemojiFlag emoji={getCountryFlag(gift.country)} className="text-2xl" />
              <span className="text-xs uppercase tracking-widest text-stone-400">{gift.country}</span>
            </div>

            {/* Word */}
            <h1 className="text-5xl font-serif text-stone-900 text-center mb-2">{gift.word}</h1>

            {/* Translation */}
            <p className="text-amber-600 text-lg text-center mb-1">{gift.translation}</p>

            {/* Pronunciation */}
            {gift.pronunciation && (
              <p className="text-stone-400 text-sm italic text-center mb-4">/{gift.pronunciation}/</p>
            )}

            {/* Explanation */}
            <p className="text-stone-500 text-sm text-center mb-6">
              {gift.explanation}
            </p>

            {/* Divider */}
            <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mb-6"></div>

            {/* Meaning */}
            <p className="text-stone-600 text-lg leading-relaxed text-center font-serif italic">
              &quot;{gift.meaning}&quot;
            </p>
          </div>

          {/* Poem Section */}
          <div className="bg-amber-50 rounded-2xl p-6 mb-8 border border-amber-100">
            <p className="text-stone-700 leading-relaxed font-serif italic text-center whitespace-pre-line">
              {gift.poem}
            </p>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg"
          >
            <Copy size={20} />
            Kopieer link om te delen
          </button>
        </div>
      </div>
    </div>
  );
}
