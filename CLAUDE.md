# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

WereldWoorden is a Dutch-language Next.js 16 app for discovering untranslatable words from different cultures (like "Saudade", "Hygge", "Wabi-sabi"). Users can generate new word cards using AI and save them to a collection.

### Tech Stack
- Next.js 16 with App Router (React 19)
- TypeScript with strict mode
- Tailwind CSS 4 for styling
- Firebase Firestore for persistence
- Google Gemini AI (@google/genai) for word generation
- Playfair Display (serif) and Inter (sans) fonts

### Key Directories
- `src/app/` - Next.js App Router pages
- `src/lib/` - Shared utilities and services

### Data Flow
1. **Word Generation**: User describes a feeling/theme → `geminiService.generateWordCard()` calls Gemini API → generates WordCard with DeepDive content → saves to Firestore
2. **Word Display**: `wordService.getAllWords()` fetches from Firestore → renders card grid on homepage
3. **Card Detail**: `/card/[id]` route uses server component for metadata + client component for flip interaction

### Types
- `WordCard` - Main entity: word, country, pronunciation, shortDefinition, question, deepDive
- `DeepDiveContent` - Extended content: culturalContext, philosophicalInsight, exampleUsage

### Environment Variables
- `NEXT_PUBLIC_GEMINI_API_KEY` - Required for AI word generation

### Path Aliases
- `@/*` maps to `./src/*`
