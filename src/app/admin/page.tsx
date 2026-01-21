'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Loader2, MapPin, User, MessageCircle, AlertTriangle, Sparkles, Check, Globe } from 'lucide-react';
import { getAllMemories, getAllComments, deleteMemory, deleteComment } from '@/lib/memoryService';
import { getAllWords, saveWord, deleteWord } from '@/lib/wordService';
import { generateWordCard } from '@/lib/geminiService';
import { UserMemory, WordCard, Comment } from '@/lib/types';
import { getCountryFlag } from '@/lib/countryFlags';
import TwemojiFlag from '@/components/TwemojiFlag';
import DeleteModal from '@/components/DeleteModal';

interface CommentWithMemory extends Comment {
  memoryId: string;
}

export default function AdminPage() {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [comments, setComments] = useState<CommentWithMemory[]>([]);
  const [words, setWords] = useState<WordCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'words' | 'memories' | 'comments'>('generate');

  // Generate word state
  const [themeInput, setThemeInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<WordCard | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'word' | 'memory' | 'comment';
    id: string;
    name: string;
  }>({ isOpen: false, type: 'memory', id: '', name: '' });

  useEffect(() => {
    // Check for admin mode
    const params = new URLSearchParams(window.location.search);
    const admin = params.get('admin') === 'true';
    setIsAdmin(admin);

    if (!admin) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      const [memoriesData, commentsData, wordsData] = await Promise.all([
        getAllMemories(),
        getAllComments(),
        getAllWords()
      ]);
      setMemories(memoriesData);
      setComments(commentsData as CommentWithMemory[]);
      setWords(wordsData);
      setLoading(false);
    };
    loadData();
  }, []);

  const getWordForMemory = (cardId: string) => {
    return words.find(w => w.id === cardId);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeInput.trim()) return;

    setIsGenerating(true);
    try {
      const card = await generateWordCard(themeInput);
      if (card) {
        setGeneratedCard(card);
      }
    } catch (error) {
      console.error('Generate error:', error);
      alert('Er ging iets mis bij het genereren.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedCard = async () => {
    if (!generatedCard) return;

    setIsSaving(true);
    try {
      const savedId = await saveWord(generatedCard);
      if (savedId) {
        setWords(prev => [{ ...generatedCard, id: savedId }, ...prev]);
        setGeneratedCard(null);
        setThemeInput('');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Er ging iets mis bij het opslaan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.type === 'word') {
      const success = await deleteWord(deleteModal.id);
      if (success) {
        setWords(prev => prev.filter(w => w.id !== deleteModal.id));
      }
    } else if (deleteModal.type === 'memory') {
      const success = await deleteMemory(deleteModal.id);
      if (success) {
        setMemories(prev => prev.filter(m => m.id !== deleteModal.id));
      }
    } else {
      const success = await deleteComment(deleteModal.id);
      if (success) {
        setComments(prev => prev.filter(c => c.id !== deleteModal.id));
      }
    }
    setDeleteModal({ isOpen: false, type: 'memory', id: '', name: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-stone-800 mb-2">Geen toegang</h1>
          <p className="text-stone-500 mb-6">Deze pagina is alleen toegankelijk voor admins.</p>
          <Link href="/" className="text-amber-600 hover:underline">
            Terug naar home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/?admin=true" className="text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-2">
            <ArrowLeft size={20} />
            <span className="text-sm hidden sm:inline">Terug</span>
          </Link>
          <h1 className="font-serif text-xl text-stone-800">Admin</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              activeTab === 'generate'
                ? 'bg-amber-500 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles size={16} />
              <span className="hidden sm:inline">Genereer</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('words')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              activeTab === 'words'
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            Woorden ({words.length})
          </button>
          <button
            onClick={() => setActiveTab('memories')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              activeTab === 'memories'
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            Verhalen ({memories.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              activeTab === 'comments'
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            Reacties ({comments.length})
          </button>
        </div>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-800">Vind jouw magische woord</h3>
                  <p className="text-xs text-stone-500">Beschrijf een gevoel, sfeer of land</p>
                </div>
              </div>

              {!generatedCard ? (
                <form onSubmit={handleGenerate} className="space-y-4">
                  <input
                    type="text"
                    value={themeInput}
                    onChange={(e) => setThemeInput(e.target.value)}
                    placeholder="Bijv. Regenachtige zondag in Japan..."
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isGenerating || !themeInput.trim()}
                    className="w-full sm:w-auto bg-stone-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-stone-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Zoeken...
                      </>
                    ) : (
                      'Zoek woord'
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-stone-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TwemojiFlag emoji={getCountryFlag(generatedCard.country)} className="text-2xl" />
                      <div>
                        <h4 className="font-serif text-xl text-stone-800">{generatedCard.word}</h4>
                        <p className="text-xs text-stone-500">{generatedCard.country}</p>
                      </div>
                    </div>
                    <p className="text-stone-600 text-sm italic">"{generatedCard.shortDefinition}"</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSaveGeneratedCard}
                      disabled={isSaving}
                      className="flex-1 bg-green-500 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                      Opslaan
                    </button>
                    <button
                      onClick={() => { setGeneratedCard(null); setThemeInput(''); }}
                      className="flex-1 bg-stone-200 text-stone-700 px-4 py-3 rounded-xl font-bold text-sm hover:bg-stone-300"
                    >
                      Opnieuw
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Words Tab */}
        {activeTab === 'words' && (
          <div className="space-y-4">
            {words.length === 0 ? (
              <p className="text-stone-500 text-center py-12">Geen woorden gevonden</p>
            ) : (
              words.map(word => (
                <div key={word.id} className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <TwemojiFlag emoji={getCountryFlag(word.country)} className="text-xl" />
                        <span className="font-serif text-lg text-stone-800">{word.word}</span>
                      </div>
                      <p className="text-stone-500 text-sm mb-1">{word.country}</p>
                      <p className="text-stone-600 text-sm line-clamp-2">{word.shortDefinition}</p>
                    </div>

                    <button
                      onClick={() => setDeleteModal({
                        isOpen: true,
                        type: 'word',
                        id: word.id,
                        name: word.word
                      })}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Memories Tab */}
        {activeTab === 'memories' && (
          <div className="space-y-4">
            {memories.length === 0 ? (
              <p className="text-stone-500 text-center py-12">Geen verhalen gevonden</p>
            ) : (
              memories.map(memory => {
                const word = getWordForMemory(memory.cardId);
                return (
                  <div key={memory.id} className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {word && (
                            <span className="text-sm font-medium text-amber-600">{word.word}</span>
                          )}
                          <span className="text-xs text-stone-400">
                            {new Date(memory.timestamp).toLocaleDateString('nl-NL')}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500 mb-2">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {memory.userName || 'Anoniem'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span className="truncate max-w-[150px]">{memory.userLocation.name}</span>
                          </span>
                        </div>

                        <p className="text-stone-700 text-sm line-clamp-2">{memory.text}</p>

                        {memory.mediaUrl && (
                          <img
                            src={memory.mediaUrl}
                            alt=""
                            className="mt-2 w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                          />
                        )}
                      </div>

                      <button
                        onClick={() => setDeleteModal({
                          isOpen: true,
                          type: 'memory',
                          id: memory.id,
                          name: `verhaal van ${memory.userName || 'Anoniem'}`
                        })}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-stone-500 text-center py-12">Geen reacties gevonden</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <MessageCircle size={14} className="text-amber-500" />
                        <span className="text-sm font-medium text-stone-700">{comment.userName}</span>
                        <span className="text-xs text-stone-400">
                          {new Date(comment.timestamp).toLocaleDateString('nl-NL')}
                        </span>
                      </div>

                      <p className="text-stone-700 text-sm">{comment.text}</p>

                      <Link
                        href={`/stories/${comment.memoryId}`}
                        className="text-xs text-amber-600 hover:underline mt-2 inline-block"
                      >
                        Bekijk verhaal
                      </Link>
                    </div>

                    <button
                      onClick={() => setDeleteModal({
                        isOpen: true,
                        type: 'comment',
                        id: comment.id,
                        name: `reactie van ${comment.userName}`
                      })}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bottom padding for mobile */}
        <div className="h-8"></div>
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        wordName={deleteModal.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, type: 'memory', id: '', name: '' })}
      />
    </div>
  );
}
