export interface DeepDiveContent {
  culturalContext: string;
  philosophicalInsight: string;
  exampleUsage: string;
}

export interface WordCard {
  id: string;
  word: string;
  country: string;
  shortDefinition: string;
  question: string;
  pronunciation?: string;
  deepDive?: DeepDiveContent;
}

export interface UserMemory {
  id: string;
  cardId: string;
  userName: string;
  userLocation: {
    lat: number;
    lng: number;
    name?: string;
  };
  text: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'text' | 'none';
  timestamp: number;
}

export interface Comment {
  id: string;
  memoryId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface Gift {
  id: string;
  withPerson: string;
  memory: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  word: string;
  translation: string;
  country: string;
  pronunciation?: string;
  meaning: string;
  poem: string;
  timestamp: number;
}
