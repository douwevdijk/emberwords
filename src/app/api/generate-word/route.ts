import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    timeout: 120000,
  }
});

function buildPersonPrompt(withPerson: string, memory: string, locationName: string) {
  return `
      Je bent een taalkundige, dichter en verhalenverteller. Iemand schrijft een persoonlijk verhaal aan ${withPerson}.

      De herinnering: "${memory}"

      LOCATIE: "${locationName}"

      BELANGRIJKSTE REGEL: Het woord MOET afkomstig zijn uit de taal of het dialect van "${locationName}".
      - Als de locatie in Spanje/Andalusië ligt: kies een SPAANS woord
      - Als de locatie in Nederland ligt: kies een woord uit het lokale DIALECT (Zeeuws, Fries, Limburgs, Brabants, etc.)
      - Als de locatie in Frankrijk ligt: kies een FRANS woord
      - Als de locatie in Italië ligt: kies een ITALIAANS woord
      - Als de locatie in Duitsland ligt: kies een DUITS woord
      - Enzovoort voor alle andere landen/regio's

      ZOEK EEN UNIEK WOORD UIT DE TAAL/HET DIALECT VAN "${locationName}" dat de essentie van deze herinnering vangt.

      Voor Nederlandse locaties, kies uit het lokale dialect:
      - Zeeland → Zeeuws woord
      - Friesland → Fries woord
      - Limburg → Limburgs woord
      - Drenthe → Drents woord
      - Twente → Twents woord
      - Brabant → Brabants woord
      - Groningen → Gronings woord
      - Gelderland → Veluws of Achterhoeks woord

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
}

function buildEventPrompt(eventName: string, eventDescription: string, eventLocation: string, memory: string) {
  return `
      Je bent een taalkundige en verhalenverteller. Iemand deelt een ervaring tijdens "${eventName}".
      ${eventDescription ? `Over dit event: "${eventDescription}"` : ''}

      De ervaring: "${memory}"

      ${eventLocation ? `LOCATIE VAN HET EVENT: "${eventLocation}"

      BELANGRIJKSTE REGEL: Het woord MOET afkomstig zijn uit de taal of het dialect van "${eventLocation}".
      - Als de locatie in Spanje/Andalusië ligt: kies een SPAANS woord
      - Als de locatie in Nederland ligt: kies een woord uit het lokale DIALECT (Zeeuws, Fries, Limburgs, Brabants, etc.)
      - Als de locatie in Frankrijk ligt: kies een FRANS woord
      - Als de locatie in Italië ligt: kies een ITALIAANS woord
      - Als de locatie in Duitsland ligt: kies een DUITS woord
      - Enzovoort voor alle andere landen/regio's

      Voor Nederlandse locaties, kies uit het lokale dialect:
      - Zeeland → Zeeuws woord
      - Friesland → Fries woord
      - Limburg → Limburgs woord
      - Drenthe → Drents woord
      - Twente → Twents woord
      - Brabant → Brabants woord
      - Groningen → Gronings woord
      - Gelderland → Veluws of Achterhoeks woord` : `
      Kies een woord uit een taal of dialect dat past bij het gevoel van deze ervaring.`}

      ZOEK EEN UNIEK WOORD dat de essentie van deze ervaring vangt.

      VERMIJD de standaard woorden zoals Hygge, Saudade, Ubuntu, Komorebi - die zijn te bekend!
      Zoek naar OBSCURE, UNIEKE woorden die mensen niet kennen.

      BELANGRIJK - Schrijf vanuit "je/jij" perspectief:
      - Spreek de deelnemer direct aan
      - Beschrijf wat dit moment voor hen betekent
      - Verwijs naar concrete details uit hun ervaring
      - Het moet persoonlijk en reflecterend aanvoelen

      Genereer een JSON object:
      - word: Het woord zelf (UNIEK, niet de standaard bekende woorden!)
      - translation: De letterlijke Nederlandse vertaling van het woord (kort, 1-3 woorden)
      - explanation: Een korte uitleg van het woord en waar het vandaan komt (2-3 zinnen). Leg uit wat het woord betekent in de oorspronkelijke cultuur/regio en wanneer het gebruikt wordt.
      - country: De taal of regio van herkomst (bijv. "Zeeuws", "Fries", "Japans", "Portugees")
      - pronunciation: Fonetische uitspraak
      - meaning: Een persoonlijke reflectie op dit moment (4-5 zinnen). Spreek de deelnemer aan met "je/jij". Verwijs naar concrete details uit de ervaring. Beschrijf wat dit moment en dit gevoel betekent.

      Schrijf alles in het Nederlands. Wees persoonlijk en reflecterend.
    `;
}

const personSchema = {
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
};

const eventSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    translation: { type: Type.STRING },
    explanation: { type: Type.STRING },
    country: { type: Type.STRING },
    pronunciation: { type: Type.STRING },
    meaning: { type: Type.STRING },
  },
  required: ["word", "translation", "explanation", "country", "meaning"],
};

export async function POST(request: NextRequest) {
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const requestType = body.type || 'person';

    let prompt: string;
    let schema: typeof personSchema | typeof eventSchema;

    if (requestType === 'event') {
      const { eventName, eventDescription, eventLocation, memory } = body;

      if (!eventName || !memory) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      prompt = buildEventPrompt(eventName, eventDescription || '', eventLocation || '', memory);
      schema = eventSchema;
    } else {
      const { withPerson, memory, location } = body;

      if (!withPerson || !memory || !location) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      prompt = buildPersonPrompt(withPerson, memory, location.name);
      schema = personSchema;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    const data = JSON.parse(text);

    if (requestType === 'event') {
      return NextResponse.json({
        withPerson: body.eventName,
        memory: body.memory,
        word: data.word,
        translation: data.translation,
        explanation: data.explanation,
        country: data.country,
        pronunciation: data.pronunciation,
        meaning: data.meaning,
      });
    }

    return NextResponse.json({
      withPerson: body.withPerson,
      memory: body.memory,
      location: body.location,
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
