'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Loader2, MapPin, User, MessageCircle, AlertTriangle } from 'lucide-react';
import { getAllMemories, getAllComments, deleteMemory, deleteComment } from '@/lib/memoryService';
import { getAllWords } from '@/lib/wordService';
import { UserMemory, WordCard, Comment } from '@/lib/types';
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
  const [activeTab, setActiveTab] = useState<'memories' | 'comments'>('memories');

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'memory' | 'comment';
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

  const handleDeleteConfirm = async () => {
    if (deleteModal.type === 'memory') {
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
            <span className="text-sm">Terug</span>
          </Link>
          <h1 className="font-serif text-xl text-stone-800">Admin</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('memories')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'memories'
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            Verhalen ({memories.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'comments'
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            Reacties ({comments.length})
          </button>
        </div>

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
                        <div className="flex items-center gap-2 mb-2">
                          {word && (
                            <span className="text-sm font-medium text-amber-600">{word.word}</span>
                          )}
                          <span className="text-xs text-stone-400">
                            {new Date(memory.timestamp).toLocaleDateString('nl-NL')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-stone-500 mb-2">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {memory.userName || 'Anoniem'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {memory.userLocation.name}
                          </span>
                        </div>

                        <p className="text-stone-700 text-sm line-clamp-2">{memory.text}</p>

                        {memory.mediaUrl && (
                          <img
                            src={memory.mediaUrl}
                            alt=""
                            className="mt-2 w-20 h-20 object-cover rounded-lg"
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
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                      <div className="flex items-center gap-2 mb-2">
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
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
