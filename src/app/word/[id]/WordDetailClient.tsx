'use client';

import { useState, useCallback } from 'react';
import { BookOpen, RotateCcw, Share2, Check } from 'lucide-react';
import { WordCard } from '@/lib/types';
import { getCountryFlag } from '@/lib/countryFlags';
import TwemojiFlag from '@/components/TwemojiFlag';
import Toast from '@/components/Toast';

interface Props {
  card: WordCard;
}

export default function WordDetailClient({ card }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const deepDive = card.deepDive || null;

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: card.word, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShowToast(true);
      }
    } catch {
      // Fallback for clipboard failures
      await navigator.clipboard.writeText(url);
      setShowToast(true);
    }
  }, [card.word]);

  return (
    <div className="fixed inset-0 perspective-1000">
      <Toast message="Link copied!" isVisible={showToast} onClose={() => setShowToast(false)} />
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={`relative w-full h-full transform-style-3d flip-transition cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT - White */}
        <div className="absolute inset-0 backface-hidden bg-white overflow-auto">
          <div className="flex flex-col items-center justify-start pt-24 md:justify-center md:pt-0 min-h-screen p-8">
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-4">{card.country}</p>
            <h1 className="text-5xl font-serif text-stone-900 mb-2 text-center">{card.word}</h1>
            {card.pronunciation && (
              <p className="text-stone-400 text-sm italic mb-8">/{card.pronunciation}/</p>
            )}
            <div className="w-12 h-1 bg-amber-400 rounded-full mb-12"></div>
            <div className="flex flex-col items-center gap-2 animate-pulse">
              <RotateCcw size={24} className="text-amber-500" />
              <p className="text-stone-600 text-base font-medium tracking-wide">
                Tap to flip
              </p>
            </div>
          </div>
        </div>

        {/* BACK - Dark */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-stone-900 text-white overflow-auto">
          <div className="sticky top-0 z-50 bg-stone-900/80 backdrop-blur-md border-b border-stone-800 px-4 py-4 flex justify-center items-center">
            <p className="text-stone-300 text-base flex items-center gap-2 font-medium">
              <RotateCcw size={18} />
              Tap to flip back
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
                Deep Dive
              </h3>
              {deepDive ? (
                <div className="space-y-4 text-stone-400 leading-relaxed">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-stone-600 mb-1">Cultural Context</h4>
                    <p>{deepDive.culturalContext}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-stone-600 mb-1">Philosophy</h4>
                    <p className="italic border-l-2 border-amber-500 pl-3">{deepDive.philosophicalInsight}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-stone-600 mb-1">Example</h4>
                    <p className="bg-stone-800 p-3 rounded-lg text-sm">{deepDive.exampleUsage}</p>
                  </div>
                </div>
              ) : (
                <p className="text-stone-500 italic">No deep dive available for this word.</p>
              )}
            </div>

            {card.question && (
              <div className="py-6 border-t border-stone-800">
                <div className="bg-stone-800 p-4 rounded-lg border-l-4 border-amber-500 mb-6">
                  <p className="text-stone-400 text-xs uppercase tracking-wide mb-2">Ask yourself</p>
                  <p className="text-white font-medium">{card.question}</p>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={handleShare}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg"
                  >
                    <Share2 size={20} />
                    Share this word
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
