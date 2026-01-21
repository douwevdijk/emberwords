'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Map, User, Loader2 } from 'lucide-react';
import { getAllMemories } from '@/lib/memoryService';
import { getAllWords } from '@/lib/wordService';
import { UserMemory, WordCard } from '@/lib/types';
import { getCountryFlag } from '@/lib/countryFlags';
import TwemojiFlag from '@/components/TwemojiFlag';

export default function StoriesPage() {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [words, setWords] = useState<WordCard[]>([]);
  const [loading, setLoading] = useState(true);

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
          <p className="text-stone-500">Verhalen laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-2">
            <ArrowLeft size={20} />
            <span className="text-sm hidden sm:inline">Terug</span>
          </Link>

          <h1 className="font-serif text-lg text-stone-800">Alle verhalen</h1>

          <Link
            href="/stories/map"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors text-sm"
          >
            <Map size={16} />
            <span className="hidden sm:inline">Kaart</span>
          </Link>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {memories.length === 0 ? (
          <div className="text-center py-16">
            <MapPin size={48} className="mx-auto mb-4 text-stone-300" />
            <p className="text-stone-500">Nog geen verhalen gedeeld.</p>
            <p className="text-stone-400 text-sm mt-1">Wees de eerste!</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-stone-500 mb-6">{memories.length} verhalen</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {memories.map((memory) => {
                const word = getWordForMemory(memory);
                return (
                  <Link
                    key={memory.id}
                    href={`/stories/${memory.id}`}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-stone-100"
                  >
                    {/* Image or gradient placeholder */}
                    {memory.mediaUrl && memory.mediaType === 'image' ? (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={memory.mediaUrl}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center">
                        {word && (
                          <TwemojiFlag emoji={getCountryFlag(word.country)} className="text-5xl opacity-50" />
                        )}
                      </div>
                    )}

                    <div className="p-4">
                      {/* Word badge */}
                      {word && (
                        <div className="flex items-center gap-2 mb-3">
                          <TwemojiFlag emoji={getCountryFlag(word.country)} className="text-base" />
                          <span className="text-sm font-serif text-stone-700">{word.word}</span>
                        </div>
                      )}

                      {/* Story preview */}
                      <p className="text-stone-600 text-sm line-clamp-2 mb-3">{memory.text}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-stone-400">
                        <div className="flex items-center gap-1">
                          {memory.userName ? (
                            <>
                              <User size={12} />
                              <span>{memory.userName}</span>
                            </>
                          ) : (
                            <span>Anoniem</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span className="truncate max-w-[120px]">{memory.userLocation.name}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
