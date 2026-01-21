'use client';

import { Trash2, X } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  wordName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({ isOpen, wordName, onConfirm, onCancel }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={28} className="text-red-500" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-serif text-stone-800 text-center mb-2">
          Woord verwijderen?
        </h3>
        <p className="text-stone-500 text-center mb-6">
          Weet je zeker dat je <span className="font-semibold text-stone-700">"{wordName}"</span> wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-stone-200 rounded-xl text-stone-600 font-medium hover:bg-stone-50 transition-colors"
          >
            Annuleer
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors"
          >
            Verwijder
          </button>
        </div>
      </div>
    </div>
  );
}
