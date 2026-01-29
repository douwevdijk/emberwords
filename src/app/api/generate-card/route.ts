import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import { saveWord } from "@/lib/wordService";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    timeout: 120000,
  }
});

export async function POST(request: NextRequest) {
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const { theme } = await request.json();

    if (!theme) {
      return NextResponse.json({ error: 'Missing theme' }, { status: 400 });
    }

    // Generate word card
    const cardPrompt = `
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

    const cardResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: cardPrompt,
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

    const cardText = cardResponse.text;
    if (!cardText) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    const cardData = JSON.parse(cardText);

    // Generate deep dive content
    const deepDivePrompt = `
      Je bent een expert in linguïstiek en culturele antropologie.
      Geef me een diepgaande uitleg van het woord "${cardData.word}" uit ${cardData.country}.

      De output moet JSON zijn met de volgende structuur:
      - culturalContext: Een rijke beschrijving van de culturele achtergrond (ong. 50-80 woorden).
      - philosophicalInsight: Een diepere, filosofische laag van het woord (ong. 30-50 woorden).
      - exampleUsage: Een voorbeeldzin in de originele taal (indien van toepassing) met vertaling.

      Schrijf in het Nederlands.
    `;

    const deepDiveResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: deepDivePrompt,
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

    const deepDiveText = deepDiveResponse.text;
    const deepDive = deepDiveText ? JSON.parse(deepDiveText) : null;

    const id = `gen-${Date.now()}`;

    const wordCard = {
      id,
      word: cardData.word,
      country: cardData.country,
      pronunciation: cardData.pronunciation,
      shortDefinition: cardData.shortDefinition,
      question: cardData.question,
      deepDive: deepDive || undefined,
    };

    // Save to Firestore
    await saveWord(wordCard);

    return NextResponse.json(wordCard);
  } catch (error) {
    console.error("Gemini card generation error:", error);
    return NextResponse.json({ error: 'Failed to generate card' }, { status: 500 });
  }
}
