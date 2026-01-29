import { GoogleGenAI, Type } from "@google/genai";
import { WordCard, DeepDiveContent, Gift } from "./types";
import { saveWord } from "./wordService";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const generateDeepDive = async (
  word: string,
  country: string,
): Promise<DeepDiveContent | null> => {
  if (!apiKey) {
    console.warn("No API Key found for Gemini");
    return {
      culturalContext: "API Key ontbreekt. Kan geen diepere context genereren.",
      philosophicalInsight:
        "De essentie van dit woord wacht om ontdekt te worden.",
      exampleUsage: "Niet beschikbaar.",
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
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            culturalContext: { type: Type.STRING },
            philosophicalInsight: { type: Type.STRING },
            exampleUsage: { type: Type.STRING },
          },
          required: ["culturalContext", "philosophicalInsight", "exampleUsage"],
        },
      },
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
export const generateWordCard = async (
  theme: string,
): Promise<WordCard | null> => {
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
      model: "gemini-3-flash-preview",
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
            question: { type: Type.STRING },
          },
          required: ["word", "country", "shortDefinition", "question"],
        },
      },
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
      deepDive: deepDive || undefined,
    };

    // Save to Firestore
    await saveWord(wordCard);

    return wordCard;
  } catch (error) {
    console.error("Gemini card generation error:", error);
    return null;
  }
};

// Generate a personal gift word based on a memory (returns Gift without saving)
export const generateGiftWord = async (
  withPerson: string,
  memory: string,
  location: { lat: number; lng: number; name: string },
): Promise<Omit<Gift, "id" | "timestamp"> | null> => {
  if (!apiKey) return null;

  try {
    const prompt = `
      Je bent een taalkundige, dichter en verhalenverteller. Iemand schrijft een persoonlijk verhaal aan ${withPerson}.

      De herinnering: "${memory}"
      De plek: "${location.name}"

      ZOEK EEN UNIEK, LOKAAL WOORD dat de essentie van deze specifieke herinnering vangt.

      PRIORITEIT voor woordkeuze (in deze volgorde):
      1. EERST: Kijk naar de plek "${location.name}" - zoek een woord uit die regio/dialect:
         - Als het in Zeeland is: Zeeuws woord
         - Als het in Friesland is: Fries woord
         - Als het in Limburg is: Limburgs woord
         - Als het in Drenthe is: Drents woord
         - Als het in Twente is: Twents woord
         - Als het in Brabant is: Brabants woord
         - Als het in Groningen is: Gronings woord
         - Als het in Gelderland is: Veluws of Achterhoeks woord
         - Enz.
      2. DAARNA: Als er geen passend lokaal woord is, kies uit een andere taal die bij het GEVOEL past

      VERMIJD de standaard woorden zoals Hygge, Saudade, Ubuntu, Komorebi - die zijn te bekend!
      Zoek naar OBSCURE, UNIEKE woorden die mensen niet kennen.

      BELANGRIJK - Schrijf ALTIJD vanuit "ons/wij/jij en ik" perspectief:
      - Dit is een verhaal van mij AAN ${withPerson}
      - Gebruik "wij", "ons", "jij", "samen"
      - Het woord beschrijft ONZE herinnering, ons moment samen
      - De lezer (${withPerson}) moet zich aangesproken voelen

      Genereer een JSON object:
      - word: Het woord zelf (UNIEK, niet de standaard bekende woorden!)
      - translation: De letterlijke Nederlandse vertaling van het woord (kort, 1-3 woorden)
      - explanation: Een korte uitleg van het woord en waar het vandaan komt (2-3 zinnen). Leg uit wat het woord betekent in de oorspronkelijke cultuur/regio en wanneer het gebruikt wordt.
      - country: De taal of regio van herkomst (bijv. "Zeeuws", "Fries", "Limburgs", "Welsh", "Schots-Gaelisch")
      - pronunciation: Fonetische uitspraak
      - meaning: Een persoonlijk verhaal aan ${withPerson} (4-5 zinnen). Begin met iets als "Weet je nog toen wij..." of "Dit woord is van ons, ${withPerson}...". Verwijs naar concrete details uit de herinnering. Eindig met wat dit moment voor ons betekent.
      - poem: Een persoonlijk gedicht van 6-8 regels, geschreven aan ${withPerson}. Gebruik "jij", "wij", "ons". Het gedicht moet concreet verwijzen naar de herinnering en eindigen met warmte en verbondenheid.

      Schrijf alles in het Nederlands. Wees intiem, persoonlijk en ontroerend.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            translation: { type: Type.STRING },
            explanation: { type: Type.STRING },
            country: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
            meaning: { type: Type.STRING },
            poem: { type: Type.STRING },
          },
          required: ["word", "translation", "explanation", "country", "meaning", "poem"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);

    return {
      withPerson,
      memory,
      location,
      word: data.word,
      translation: data.translation,
      explanation: data.explanation,
      country: data.country,
      pronunciation: data.pronunciation,
      meaning: data.meaning,
      poem: data.poem,
    };
  } catch (error) {
    console.error("Gemini gift generation error:", error);
    return null;
  }
};
