'use client';

import { useState } from 'react';
import { Loader2, Sparkles, Check, BookOpen, Copy, Check as CheckIcon } from 'lucide-react';
import { WordCard } from '@/lib/types';
import { saveWord } from '@/lib/wordService';
import { getCountryFlag } from '@/lib/countryFlags';
import TwemojiFlag from '@/components/TwemojiFlag';

export default function StudioPage() {
  const [themeInput, setThemeInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<WordCard | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCard, setSavedCard] = useState<WordCard | null>(null);
  const [copied, setCopied] = useState(false);

  const getWordUrl = (wordId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/word/${wordId}`;
  };

  const handleCopyLink = async (wordId: string) => {
    await navigator.clipboard.writeText(getWordUrl(wordId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeInput.trim()) return;

    setIsGenerating(true);
    setSavedCard(null);
    try {
      const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeInput, language: 'en' }),
      });
      const card = response.ok ? await response.json() : null;
      if (card) {
        setGeneratedCard(card);
      }
    } catch (error) {
      console.error('Generate error:', error);
      alert('Something went wrong while generating.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedCard = async () => {
    if (!generatedCard) return;

    const cardToSave = generatedCard;
    setIsSaving(true);
    try {
      const success = await saveWord(cardToSave);
      if (success) {
        setSavedCard(cardToSave);
        setGeneratedCard(null);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Something went wrong while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartOver = () => {
    setGeneratedCard(null);
    setSavedCard(null);
    setThemeInput('');
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 pt-12">
      <div className="max-w-2xl w-full mx-auto">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-100 p-2 rounded-full text-amber-600">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-800">Find your magical word</h3>
              <p className="text-xs text-stone-500">Describe a feeling, mood or country</p>
            </div>
          </div>

          {/* Saved state - show share link */}
          {savedCard && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <TwemojiFlag emoji={getCountryFlag(savedCard.country)} className="text-2xl" />
                <div>
                  <h4 className="font-serif text-xl text-stone-800">{savedCard.word}</h4>
                  <p className="text-stone-500 text-sm">{savedCard.country}</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-700 font-medium text-sm mb-3">Saved! Share this word:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getWordUrl(savedCard.id)}
                    className="flex-1 px-3 py-2 bg-white border border-green-200 rounded-lg text-sm text-stone-600"
                  />
                  <button
                    onClick={() => handleCopyLink(savedCard.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <button
                onClick={handleStartOver}
                className="w-full bg-stone-200 text-stone-700 px-4 py-3 rounded-xl font-bold text-sm hover:bg-stone-300"
              >
                Generate another word
              </button>
            </div>
          )}

          {/* Input state */}
          {!generatedCard && !savedCard && (
            <form onSubmit={handleGenerate} className="space-y-4">
              <input
                type="text"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                placeholder="E.g. A rainy Sunday in Japan..."
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
                    Searching...
                  </>
                ) : (
                  'Find word'
                )}
              </button>
            </form>
          )}

          {/* Preview state */}
          {generatedCard && (
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <TwemojiFlag emoji={getCountryFlag(generatedCard.country)} className="text-3xl" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">{generatedCard.country}</p>
                  <h4 className="font-serif text-2xl text-stone-800">{generatedCard.word}</h4>
                  {generatedCard.pronunciation && (
                    <p className="text-stone-400 text-sm italic">/{generatedCard.pronunciation}/</p>
                  )}
                </div>
              </div>

              <p className="text-stone-600 text-lg italic leading-relaxed">&ldquo;{generatedCard.shortDefinition}&rdquo;</p>

              {generatedCard.deepDive && (
                <div className="bg-stone-50 rounded-xl p-4 space-y-4">
                  <h5 className="font-serif text-lg text-stone-800 flex items-center gap-2">
                    <BookOpen size={18} className="text-amber-500" />
                    Deep Dive
                  </h5>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-stone-400 mb-1">Cultural Context</p>
                    <p className="text-stone-600 text-sm">{generatedCard.deepDive.culturalContext}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-stone-400 mb-1">Philosophy</p>
                    <p className="text-stone-600 text-sm italic border-l-2 border-amber-400 pl-3">{generatedCard.deepDive.philosophicalInsight}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-stone-400 mb-1">Example</p>
                    <p className="text-stone-600 text-sm bg-white p-3 rounded-lg">{generatedCard.deepDive.exampleUsage}</p>
                  </div>
                </div>
              )}

              {generatedCard.question && (
                <div className="bg-stone-800 rounded-xl p-4 border-l-4 border-amber-500">
                  <p className="text-white font-medium text-sm">{generatedCard.question}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleSaveGeneratedCard}
                  disabled={isSaving}
                  className="flex-1 bg-green-500 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  Save
                </button>
                <button
                  onClick={handleStartOver}
                  className="flex-1 bg-stone-200 text-stone-700 px-4 py-3 rounded-xl font-bold text-sm hover:bg-stone-300"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
