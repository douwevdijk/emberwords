'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Copy, Users, Loader2 } from 'lucide-react';
import { Gift } from '@/lib/types';
import { getCountryFlag } from '@/lib/countryFlags';
import TwemojiFlag from '@/components/TwemojiFlag';
import Toast from '@/components/Toast';

interface Props {
  gift: Gift;
}

export default function GiftDetailClient({ gift }: Props) {
  const [showToast, setShowToast] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setShowToast(true);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-amber-50 to-white overflow-auto">
      <Toast message="Link gekopieerd!" isVisible={showToast} onClose={() => setShowToast(false)} />

      {/* Content */}
      <div className="flex flex-col items-center justify-start pt-8 lg:pt-16 min-h-screen p-6 lg:p-12">
        <div className="w-full max-w-lg lg:max-w-2xl">
          {/* Word Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 mb-6 lg:mb-10 border border-stone-100">
            {/* Flag & Country */}
            <div className="flex items-center justify-center gap-2 mb-4 lg:mb-6">
              <TwemojiFlag emoji={getCountryFlag(gift.country)} className="text-2xl lg:text-3xl" />
              <span className="text-xs lg:text-sm uppercase tracking-widest text-stone-400">{gift.country}</span>
            </div>

            {/* Word */}
            <h1 className="text-5xl lg:text-7xl font-serif text-stone-900 text-center mb-2 lg:mb-4">{gift.word}</h1>

            {/* Translation */}
            <p className="text-amber-600 text-lg lg:text-2xl text-center mb-1 lg:mb-2">{gift.translation}</p>

            {/* Pronunciation */}
            {gift.pronunciation && (
              <p className="text-stone-400 text-sm lg:text-base italic text-center mb-4 lg:mb-6">/{gift.pronunciation}/</p>
            )}

            {/* Explanation */}
            <p className="text-stone-500 text-sm lg:text-base text-center mb-6 lg:mb-8">
              {gift.explanation}
            </p>

            {/* Divider */}
            <div className="w-12 lg:w-16 h-1 bg-amber-400 rounded-full mx-auto mb-6 lg:mb-8"></div>

            {/* Meaning */}
            <p className="text-stone-600 text-lg lg:text-xl leading-relaxed text-center font-serif italic">
              &quot;{gift.meaning}&quot;
            </p>
          </div>

          {/* Poem Section */}
          <div className="bg-amber-50 rounded-2xl p-6 lg:p-10 mb-8 lg:mb-10 border border-amber-100">
            <p className="text-stone-700 lg:text-lg leading-relaxed font-serif italic text-center whitespace-pre-line">
              {gift.poem}
            </p>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full lg:w-auto lg:px-12 lg:mx-auto lg:flex bg-stone-900 hover:bg-stone-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg mb-4"
          >
            <Copy size={20} />
            Kopieer link om te delen
          </button>

          {/* Link to person page if this gift belongs to a person */}
          {gift.personId && (
            <Link
              href={`/create/${gift.personId}`}
              onClick={() => setIsNavigating(true)}
              className="w-full lg:w-auto lg:px-12 lg:mx-auto flex items-center justify-center gap-3 py-3 text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              {isNavigating ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Users size={20} />
              )}
              {isNavigating ? 'Laden...' : 'Bekijk alle herinneringen'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
