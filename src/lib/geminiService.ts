import { GoogleGenAI, Type } from "@google/genai";
import { WordCard, DeepDiveContent, Gift } from "./types";
import { saveWord } from "./wordService";
import { saveGift } from "./giftService";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateDeepDive = async (word: string, country: string): Promise<DeepDiveContent | null> => {
  if (!apiKey) {
    console.warn("No API Key found for Gemini");
    return {
      culturalContext: "API Key ontbreekt. Kan geen diepere context genereren.",
      philosophicalInsight: "De essentie van dit woord wacht om ontdekt te worden.",
      exampleUsage: "Niet beschikbaar."
    };
  }

  try {
    const prompt = `
      Je bent een expert in linguïstiek en culturele antropologie.
      Geef me een diepgaande uitleg van het woord "${word}" uit ${country}.

      De output moet JSON zijn met de volgende structuur:
      - culturalContext: Een rijke beschrijving van de culturele achtergrond (ong. 50-80 woorden).
      - philosophicalInsight: Een diepere, filosofische laag van het woord (ong. 30-50 woorden).
      - exampleUsage: Een voorbeeldzin in de originele taal (indien van toepassing) met vertaling.

      Schrijf in het Nederlands.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            culturalContext: { type: Type.STRING },
            philosophicalInsight: { type: Type.STRING },
            exampleUsage: { type: Type.STRING }
          },
          required: ["culturalContext", "philosophicalInsight", "exampleUsage"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as DeepDiveContent;

  } catch (error) {
    console.error("Gemini generation error:", error);
    return null;
  }
};

// Generate a complete WordCard with DeepDive content and save to Firestore
export const generateWordCard = async (theme: string): Promise<WordCard | null> => {
  if (!apiKey) return null;

  try {
    const prompt = `
      Zoek een uniek, mooi, en cultureel specifiek woord (bestaand woord uit een taal ergens op de wereld) dat past bij dit thema of gevoel: "${theme}".
      Denk aan woorden zoals Saudade, Hygge, Wabi-sabi, Ubuntu.

      Genereer een JSON object voor een kaart:
      - word: Het woord zelf (hoofdlettergevoelig).
      - country: Het land of de taal van herkomst.
      - pronunciation: Fonetische uitspraak.
      - shortDefinition: Een poëtische, korte definitie (max 2 zinnen).
      - question: Een diepzinnige reflectievraag voor de lezer die bij dit woord past.

      Schrijf alles in het Nederlands.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            country: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
            shortDefinition: { type: Type.STRING },
            question: { type: Type.STRING }
          },
          required: ["word", "country", "shortDefinition", "question"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    const id = `gen-${Date.now()}`;

    // Generate DeepDive content
    const deepDive = await generateDeepDive(data.word, data.country);

    // Create complete WordCard
    const wordCard: WordCard = {
      id,
      word: data.word,
      country: data.country,
      pronunciation: data.pronunciation,
      shortDefinition: data.shortDefinition,
      question: data.question,
      deepDive: deepDive || undefined
    };

    // Save to Firestore
    await saveWord(wordCard);

    return wordCard;

  } catch (error) {
    console.error("Gemini card generation error:", error);
    return null;
  }
};

// Generate a personal gift word based on a memory
export const generateGiftWord = async (
  forPerson: string,
  memory: string,
  location: { lat: number; lng: number; name: string }
): Promise<Gift | null> => {
  if (!apiKey) return null;

  try {
    const prompt = `
      Je bent een taalkundige en verhalenverteller. Iemand wil een persoonlijk woord cadeau geven.

      Het woord is voor: "${forPerson}"
      De herinnering: "${memory}"
      De plek: "${location.name}"

      Zoek een bestaand onvertaalbaar woord uit een taal ergens ter wereld dat perfect past bij deze herinnering en persoon.
      Denk aan woorden zoals Saudade, Hygge, Wabi-sabi, Ubuntu, Komorebi, etc.

      Het woord moet de essentie van de herinnering vangen.

      Genereer een JSON object:
      - word: Het woord zelf
      - country: Het land of de taal van herkomst
      - pronunciation: Fonetische uitspraak
      - meaning: Een warme, persoonlijke betekenis die specifiek verwijst naar de herinnering en de persoon (2-3 zinnen, schrijf "jij" of de naam van de persoon)

      Schrijf alles in het Nederlands.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            country: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
            meaning: { type: Type.STRING }
          },
          required: ["word", "country", "meaning"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    const id = `gift-${Date.now()}`;

    const gift: Gift = {
      id,
      forPerson,
      memory,
      location,
      word: data.word,
      country: data.country,
      pronunciation: data.pronunciation,
      meaning: data.meaning,
      timestamp: Date.now()
    };

    // Save to Firestore
    await saveGift(gift);

    return gift;

  } catch (error) {
    console.error("Gemini gift generation error:", error);
    return null;
  }
};
