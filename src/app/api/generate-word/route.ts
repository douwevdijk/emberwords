import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";

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
    const { withPerson, memory, location } = await request.json();

    if (!withPerson || !memory || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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
      - poem: Een meesterlijk gedicht van 6-8 regels dat het woord en de herinnering samensmelt.
        Schrijf dit gedicht alsof je een van de beste dichters ter wereld bent - denk aan de stijl van Rutger Kopland, Toon Tellegen, of Remco Campert.
        Het gedicht moet:
        - Het woord en de herinnering verweven tot één geheel
        - Subtiel en beeldend zijn, niet letterlijk
        - Eenvoudige maar krachtige woorden gebruiken
        - Een onverwachte wending of beeld bevatten
        - Ruimte laten voor interpretatie
        - Eindigen met een regel die blijft hangen
        NIET schrijven aan een persoon, maar over het moment, het gevoel, de herinnering zelf.

      Schrijf alles in het Nederlands. Wees intiem, persoonlijk en ontroerend.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
    if (!text) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    const data = JSON.parse(text);

    return NextResponse.json({
      withPerson,
      memory,
      location,
      word: data.word,
      translation: data.translation,
      explanation: data.explanation,
      country: data.country,
      pronunciation: data.pronunciation,
      meaning: data.meaning,
      poem: data.poem?.replace(/\\n/g, '\n') || data.poem,
    });
  } catch (error) {
    console.error("Gemini gift generation error:", error);
    return NextResponse.json({ error: 'Failed to generate word' }, { status: 500 });
  }
}
