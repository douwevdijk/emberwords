'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Sparkles, Check, Trash2, BookOpen, Copy, MapPin } from 'lucide-react';
import { WordCard } from '@/lib/types';
import { getAllWords, deleteWord } from '@/lib/wordService';
import { generateWordCard } from '@/lib/geminiService';
import { getCountryFlag } from '@/lib/countryFlags';
import TwemojiFlag from '@/components/TwemojiFlag';
import Toast from '@/components/Toast';
import DeleteModal from '@/components/DeleteModal';

export default function HomePage() {
  const [cards, setCards] = useState<WordCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [themeInput, setThemeInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<WordCard | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loadingCardId, setLoadingCardId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; card: WordCard | null }>({ isOpen: false, card: null });

  useEffect(() => {
    const loadWords = async () => {
      setLoading(true);
      const firestoreWords = await getAllWords();
      setCards(firestoreWords);
      setLoading(false);
    };
    loadWords();

    // Check for admin mode via URL param ?admin=true
    const params = new URLSearchParams(window.location.search);
    setIsAdmin(params.get('admin') === 'true');
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeInput.trim()) return;

    setIsGenerating(true);
    setGeneratedCard(null);

    const card = await generateWordCard(themeInput);
    if (card) {
      setGeneratedCard(card);
    }
    setIsGenerating(false);
  };

  const saveCard = () => {
    if (generatedCard) {
      setCards((prev) => [generatedCard, ...prev]);
      setGeneratedCard(null);
      setThemeInput('');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.card) return;
    const success = await deleteWord(deleteModal.card.id);
    if (success) {
      setCards((prev) => prev.filter((c) => c.id !== deleteModal.card?.id));
    }
    setDeleteModal({ isOpen: false, card: null });
  };

  const handleShare = async (card: WordCard, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/card/${card.id}`;
    await navigator.clipboard.writeText(url);
    setShowToast(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-stone-400" size={32} />
          <p className="text-stone-500">Woorden laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6 flex flex-col items-center">
      <header className="mb-10 text-center mt-6 w-full max-w-4xl">
        <h1 className="text-4xl font-serif font-bold text-stone-800 mb-2">Emberwords</h1>
        <p className="text-stone-500 mb-4">Ontdek woorden die gevoelens beschrijven waar wij geen naam voor hebben.</p>

        {/* Link to stories */}
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors mb-8"
        >
          <MapPin size={16} />
          Bekijk alle verhalen
        </Link>

        {/* AI Generator Section - Admin only */}
        {isAdmin && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-orange-400 to-red-400"></div>

            {!generatedCard ? (
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                  <Sparkles size={24} />
                </div>
                <div className="flex-1 text-left w-full">
                  <h3 className="font-serif text-lg font-bold text-stone-800">Vind jouw magische woord</h3>
                  <p className="text-xs text-stone-500">Beschrijf een gevoel, sfeer of land en ontdek het perfecte woord.</p>
                </div>
                <form onSubmit={handleGenerate} className="flex w-full md:w-auto gap-2">
                  <input
                    type="text"
                    value={themeInput}
                    onChange={(e) => setThemeInput(e.target.value)}
                    placeholder="Bijv. Regenachtige zondag in Japan..."
                    className="flex-1 md:w-64 px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isGenerating || !themeInput}
                    className="bg-stone-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-stone-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={16} /> : 'Zoek'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-fade-in text-left">
                {/* Header */}
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">{generatedCard.country}</p>
                  <h2 className="text-3xl font-serif text-stone-800 mb-1">{generatedCard.word}</h2>
                  {generatedCard.pronunciation && (
                    <p className="text-stone-400 text-sm italic">/{generatedCard.pronunciation}/</p>
                  )}
                </div>

                {/* Definition */}
                <div className="mb-6">
                  <p className="text-stone-600 leading-relaxed">&quot;{generatedCard.shortDefinition}&quot;</p>
                </div>

                {/* DeepDive */}
                {generatedCard.deepDive && (
                  <div className="mb-6 p-4 bg-stone-50 rounded-xl space-y-4">
                    <h4 className="font-serif text-lg text-stone-800 flex items-center gap-2">
                      <BookOpen size={18} className="text-amber-500" />
                      De Diepte In
                    </h4>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-stone-400 mb-1">Culturele Context</p>
                      <p className="text-stone-600 text-sm">{generatedCard.deepDive.culturalContext}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-stone-400 mb-1">Filosofie</p>
                      <p className="text-stone-600 text-sm italic border-l-2 border-amber-400 pl-3">{generatedCard.deepDive.philosophicalInsight}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-stone-400 mb-1">Voorbeeld</p>
                      <p className="text-stone-600 text-sm bg-white p-2 rounded">{generatedCard.deepDive.exampleUsage}</p>
                    </div>
                  </div>
                )}

                {/* Question */}
                <div className="mb-6 p-4 bg-stone-800 rounded-xl border-l-4 border-amber-500">
                  <p className="text-white font-medium">{generatedCard.question}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setGeneratedCard(null)} className="px-4 py-2 text-stone-500 hover:text-stone-800 text-sm">
                    Annuleer
                  </button>
                  <button onClick={saveCard} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-green-700 flex items-center gap-2 shadow-md">
                    <Check size={16} /> Toevoegen
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Existing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full">
        {cards.map((card) => (
          <div key={card.id} className="group relative h-full">
            <Link
              href={`/card/${card.id}`}
              className="block h-full"
              onClick={() => setLoadingCardId(card.id)}
            >
              <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-stone-100 h-full flex flex-col items-center justify-center relative overflow-hidden min-h-[200px]">
                <div className="absolute top-0 left-0 w-full h-1 bg-stone-200 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                {loadingCardId === card.id ? (
                  <Loader2 className="animate-spin text-amber-500" size={32} />
                ) : (
                  <>
                    <h3 className="text-2xl font-serif text-stone-800 mb-2">{card.word}</h3>
                    <span className="text-sm flex items-center gap-1.5">
                      <TwemojiFlag emoji={getCountryFlag(card.country)} className="text-lg" />
                      <span className="text-xs uppercase tracking-widest text-stone-400">{card.country}</span>
                    </span>
                  </>
                )}
              </div>
            </Link>
            {/* Copy link button */}
            <button
              onClick={(e) => handleShare(card, e)}
              className="absolute top-2 left-2 p-2 bg-white/90 rounded-full text-stone-400 hover:text-amber-500 hover:bg-amber-50 shadow-sm transition-all"
            >
              <Copy size={16} />
            </button>
            {/* Delete button - Admin only */}
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setDeleteModal({ isOpen: true, card });
                }}
                className="absolute top-2 right-2 p-2 bg-white/80 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      <Toast message="Link gekopieerd!" isVisible={showToast} onClose={() => setShowToast(false)} />

      <DeleteModal
        isOpen={deleteModal.isOpen}
        wordName={deleteModal.card?.word || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, card: null })}
      />
    </div>
  );
}
