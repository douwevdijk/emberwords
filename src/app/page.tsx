'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Trash2, Copy, MapPin } from 'lucide-react';
import { WordCard } from '@/lib/types';
import { getAllWords, deleteWord } from '@/lib/wordService';
import { getCountryFlag } from '@/lib/countryFlags';
import TwemojiFlag from '@/components/TwemojiFlag';
import Toast from '@/components/Toast';
import DeleteModal from '@/components/DeleteModal';

export default function HomePage() {
  const [cards, setCards] = useState<WordCard[]>([]);
  const [loading, setLoading] = useState(true);
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
        <p className="text-stone-500 mb-6">Ontdek woorden die gevoelens beschrijven waar wij geen naam voor hebben.</p>

        {/* Link to stories */}
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors"
        >
          <MapPin size={16} />
          Bekijk alle verhalen
        </Link>
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
