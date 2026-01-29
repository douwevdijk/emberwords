'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Loader2, User, FileText } from 'lucide-react';
import { createPerson } from '@/lib/personService';

export default function CreatePersonPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('Vul een naam in');
      return;
    }

    setIsCreating(true);

    const result = await createPerson(name.trim(), description.trim(), '');

    if (result) {
      // Send admin email (we'll implement this later, for now show token in URL)
      // For now, redirect to person page with admin token
      router.push(`/create/${result.id}?beheer=${result.adminToken}`);
    } else {
      alert('Er ging iets mis. Probeer opnieuw.');
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-amber-50 to-white overflow-auto">
      {/* Loading Overlay */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-20 h-20 lg:w-24 lg:h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Flame size={40} className="text-amber-600 lg:hidden" />
            <Flame size={48} className="text-amber-600 hidden lg:block" />
          </div>
          <h2 className="font-serif text-2xl lg:text-3xl text-stone-800 mb-2">Even geduld...</h2>
          <p className="text-stone-500 text-center max-w-xs lg:text-lg">
            We maken de pagina aan.
          </p>
          <div className="mt-6 flex gap-1">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col items-center justify-start pt-12 lg:pt-16 min-h-screen p-6 lg:p-12">
        <div className="w-full max-w-lg lg:max-w-2xl">
          {/* Intro */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flame size={32} className="text-amber-600 lg:hidden" />
              <Flame size={40} className="text-amber-600 hidden lg:block" />
            </div>
            <h1 className="font-serif text-2xl lg:text-4xl text-stone-800 mb-2 lg:mb-4">Herinneringen verzamelen</h1>
            <p className="text-stone-600 lg:text-lg">
              Maak een pagina aan voor iemand en verzamel samen herinneringen.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-stone-100">
            <div className="space-y-6 lg:space-y-8">
              {/* Name */}
              <div>
                <label className="block text-sm lg:text-base font-medium text-stone-700 mb-2 lg:mb-3">
                  <User size={16} className="inline mr-2" />
                  Voor wie is deze pagina?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Naam"
                  className="w-full px-4 py-3 lg:py-4 lg:text-lg border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm lg:text-base font-medium text-stone-700 mb-2 lg:mb-3">
                  <FileText size={16} className="inline mr-2" />
                  Korte beschrijving (optioneel)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bijv. 'Voor opa's 80ste verjaardag'"
                  className="w-full h-24 lg:h-32 p-4 lg:text-lg border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-stone-800"
                />
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreate}
                disabled={isCreating || !name.trim()}
                className="w-full lg:w-auto lg:px-12 lg:mx-auto lg:flex bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg mt-4"
              >
                {isCreating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Aanmaken...
                  </>
                ) : (
                  <>
                    <Flame size={20} />
                    Pagina aanmaken
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
