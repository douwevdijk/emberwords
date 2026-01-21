'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Filter, Map, User, Loader2 } from 'lucide-react';
import { getAllMemories } from '@/lib/memoryService';
import { getAllWords } from '@/lib/wordService';
import { UserMemory, WordCard } from '@/lib/types';
import { getCountryFlag } from '@/lib/countryFlags';
import TwemojiFlag from '@/components/TwemojiFlag';

export default function StoriesPage() {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [words, setWords] = useState<WordCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterWord, setFilterWord] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');

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

  // Get unique countries from words
  const countries = [...new Set(words.map(w => w.country))].sort();

  // Filter memories
  const filteredMemories = memories.filter(m => {
    if (filterWord && m.cardId !== filterWord) return false;
    if (filterCountry) {
      const word = words.find(w => w.id === m.cardId);
      if (!word || word.country !== filterCountry) return false;
    }
    return true;
  });

  // Get word info for a memory
  const getWordForMemory = (memory: UserMemory) => {
    return words.find(w => w.id === memory.cardId);
  };

  const clearFilters = () => {
    setFilterWord('');
    setFilterCountry('');
  };

  const hasFilters = filterWord || filterCountry;

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
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-2">
            <ArrowLeft size={20} />
            <span className="text-sm hidden sm:inline">Terug</span>
          </Link>

          <h1 className="font-serif text-lg text-stone-800">Alle verhalen</h1>

          <div className="flex items-center gap-2">
            <Link
              href="/stories/map"
              className="p-2 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              title="Bekijk op kaart"
            >
              <Map size={20} />
            </Link>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-full transition-colors ${hasFilters ? 'bg-amber-100 text-amber-600' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'}`}
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-3 p-4 bg-stone-50 rounded-xl border border-stone-200 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs text-stone-500 mb-1">Woord</label>
                <select
                  value={filterWord}
                  onChange={(e) => setFilterWord(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="">Alle woorden</option>
                  {words.map(word => (
                    <option key={word.id} value={word.id}>{word.word}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-xs text-stone-500 mb-1">Land</label>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="">Alle landen</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="self-end px-3 py-2 text-sm text-stone-500 hover:text-stone-700"
                >
                  Wissen
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stories Grid */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-16">
            <MapPin size={48} className="mx-auto mb-4 text-stone-300" />
            <p className="text-stone-500">Nog geen verhalen gedeeld.</p>
            <p className="text-stone-400 text-sm mt-1">Wees de eerste!</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-stone-500 mb-6">{filteredMemories.length} verhalen</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredMemories.map((memory) => {
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
