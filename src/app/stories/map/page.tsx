'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, X, Loader2, MapPin, User, Globe } from 'lucide-react';
import { getAllMemories } from '@/lib/memoryService';
import { getAllWords } from '@/lib/wordService';
import { UserMemory, WordCard } from '@/lib/types';
import { getCountryFlag } from '@/lib/countryFlags';
import TwemojiFlag from '@/components/TwemojiFlag';

const WorldMap = lazy(() => import('@/components/WorldMap'));

export default function MapPage() {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [words, setWords] = useState<WordCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<UserMemory | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [memoriesData, wordsData] = await Promise.all([
        getAllMemories(),
        getAllWords()
      ]);
      setMemories(memoriesData);
      setWords(wordsData);
      setLoading(false);
    };
    loadData();
  }, []);

  // Get word info for a memory
  const getWordForMemory = (memory: UserMemory) => {
    return words.find(w => w.id === memory.cardId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-stone-400" size={32} />
          <p className="text-stone-500">Kaart laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-3">
        <div className="flex items-center justify-center max-w-7xl mx-auto relative">
          <Link href="/stories" className="absolute left-0 text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-2">
            <ArrowLeft size={20} />
            <span className="text-sm hidden sm:inline">Terug</span>
          </Link>

          <h1 className="font-serif text-lg text-stone-800">Kaart</h1>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-stone-100">
            <Loader2 className="animate-spin text-stone-400" size={32} />
          </div>
        }>
          <WorldMap
            memories={memories}
            words={words}
            onSelectMemory={setSelectedMemory}
          />
        </Suspense>

        {/* Stats overlay */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-stone-200">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-stone-600">
              <MapPin size={16} className="text-amber-500" />
              <span>{memories.length}</span>
            </div>
            <div className="flex items-center gap-1 text-stone-600">
              <Globe size={16} className="text-stone-400" />
              <span>{new Set(memories.map(m => getWordForMemory(m)?.country).filter(Boolean)).size} landen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected memory detail - Mobile bottom sheet */}
      {selectedMemory && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl border-t border-stone-200 max-h-[60vh] overflow-auto animate-slide-up">
          <div className="sticky top-0 bg-white px-4 py-3 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getWordForMemory(selectedMemory) && (
                <>
                  <TwemojiFlag emoji={getCountryFlag(getWordForMemory(selectedMemory)!.country)} className="text-xl" />
                  <span className="font-serif text-lg">{getWordForMemory(selectedMemory)?.word}</span>
                </>
              )}
            </div>
            <button
              onClick={() => setSelectedMemory(null)}
              className="p-2 text-stone-400 hover:text-stone-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            {/* User info */}
            {selectedMemory.userName && (
              <div className="flex items-center gap-2 text-stone-500 text-sm mb-3">
                <User size={16} />
                <span>{selectedMemory.userName}</span>
              </div>
            )}

            {/* Location */}
            <div className="flex items-center gap-2 text-stone-500 text-sm mb-4">
              <MapPin size={16} className="text-amber-500" />
              <span>{selectedMemory.userLocation.name}</span>
            </div>

            {/* Story text */}
            <p className="text-stone-700 leading-relaxed mb-4">{selectedMemory.text}</p>

            {/* Image if present */}
            {selectedMemory.mediaUrl && selectedMemory.mediaType === 'image' && (
              <img
                src={selectedMemory.mediaUrl}
                alt="Verhaal afbeelding"
                className="w-full rounded-xl object-cover max-h-48"
              />
            )}

            {/* Link to word */}
            {getWordForMemory(selectedMemory) && (
              <Link
                href={`/card/${selectedMemory.cardId}`}
                className="mt-4 block w-full bg-stone-900 text-white py-3 rounded-xl font-bold text-center hover:bg-stone-800 transition-colors"
              >
                Bekijk {getWordForMemory(selectedMemory)?.word}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
