'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, User, Send, Loader2, MessageCircle } from 'lucide-react';
import { getMemoryById, addCommentToMemory, getCommentsForMemory } from '@/lib/memoryService';
import { getWordById } from '@/lib/wordService';
import { UserMemory, WordCard, Comment } from '@/lib/types';
import { getCountryFlag } from '@/lib/countryFlags';
import TwemojiFlag from '@/components/TwemojiFlag';

interface Props {
  params: Promise<{ id: string }>;
}

export default function StoryPage({ params }: Props) {
  const { id } = use(params);
  const [memory, setMemory] = useState<UserMemory | null>(null);
  const [word, setWord] = useState<WordCard | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Comment form
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const memoryData = await getMemoryById(id);
      if (memoryData) {
        setMemory(memoryData);
        const wordData = await getWordById(memoryData.cardId);
        setWord(wordData);
        const commentsData = await getCommentsForMemory(id);
        setComments(commentsData);
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    const success = await addCommentToMemory(id, {
      userName: commentName.trim() || 'Anoniem',
      text: commentText.trim()
    });

    if (success) {
      // Reload comments
      const commentsData = await getCommentsForMemory(id);
      setComments(commentsData);
      setCommentName('');
      setCommentText('');
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500">Verhaal niet gevonden</p>
          <Link href="/stories" className="text-amber-600 hover:underline mt-2 inline-block">
            Terug naar alle verhalen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-4">
        <Link href="/stories" className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-2">
          <ArrowLeft size={20} />
          <span className="text-sm">Terug</span>
        </Link>

        <div className="flex items-center justify-center min-h-[28px]">
          {word ? (
            <Link href={`/card/${word.id}`} className="flex items-center gap-2 text-stone-700 hover:text-amber-600 transition-colors">
              <TwemojiFlag emoji={getCountryFlag(word.country)} className="text-xl" />
              <span className="font-serif text-lg">{word.word}</span>
            </Link>
          ) : (
            <span className="font-serif text-lg text-stone-800">Verhaal</span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Hero image */}
        {memory.mediaUrl && memory.mediaType === 'image' && (
          <div className="p-4 pt-6">
            <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl">
              <img
                src={memory.mediaUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Author & Location */}
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-stone-200">
            <div className="flex items-center gap-2 text-stone-600">
              <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
                <User size={20} className="text-stone-500" />
              </div>
              <span className="font-medium">{memory.userName || 'Anoniem'}</span>
            </div>

            <div className="flex items-center gap-2 text-stone-500 text-sm">
              <MapPin size={16} className="text-amber-500" />
              <span>{memory.userLocation.name}</span>
            </div>
          </div>

          {/* Story text */}
          <div className="mb-8">
            <p className="text-stone-700 text-lg leading-relaxed whitespace-pre-wrap">{memory.text}</p>
          </div>

          {/* Word card with description and CTA */}
          {word && (
            <div className="mb-8 p-5 bg-stone-100 rounded-2xl">
              <div className="flex items-start gap-3 mb-4">
                <TwemojiFlag emoji={getCountryFlag(word.country)} className="text-3xl" />
                <div>
                  <p className="font-serif text-xl text-stone-800">{word.word}</p>
                  <p className="text-stone-600 text-sm mt-1">{word.shortDefinition}</p>
                </div>
              </div>

              <Link
                href={`/card/${word.id}`}
                className="block w-full bg-stone-800 text-white py-3 rounded-xl font-medium text-center hover:bg-stone-700 transition-colors"
              >
                Deel jouw verhaal over {word.word}
              </Link>
            </div>
          )}

          {/* Comments section */}
          <div className="border-t border-stone-200 pt-6">
            <h3 className="font-serif text-lg text-stone-800 mb-4 flex items-center gap-2">
              <MessageCircle size={20} className="text-amber-500" />
              Reacties ({comments.length})
            </h3>

            {/* Existing comments */}
            {comments.length > 0 && (
              <div className="space-y-4 mb-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-white p-4 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                        <User size={14} className="text-stone-400" />
                      </div>
                      <span className="text-sm font-medium text-stone-700">{comment.userName}</span>
                    </div>
                    <p className="text-stone-600 text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment form */}
            <div className="bg-white p-4 rounded-xl border border-stone-200">
              <input
                type="text"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Je naam (optioneel)"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3"
              />
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Schrijf een reactie..."
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none h-20 mb-3"
              />
              <button
                onClick={handleSubmitComment}
                disabled={isSubmitting || !commentText.trim()}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-stone-900 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    Plaats reactie
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
