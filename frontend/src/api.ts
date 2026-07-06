import Constants from 'expo-constants';

export interface Card {
  id: number;
  module: string;
  topic: string;
  persona: string;
  content: string;
  quiz_question: string;
  quiz_answer: string;
  audio_url: string | null;
  created_at: string;
}

// In Expo Go the API runs on the same machine as the Metro bundler,
// so derive the LAN IP from the dev server host.
const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
export const API_URL = `http://${host}:8000`;

export async function fetchCards(module: string, persona?: string): Promise<Card[]> {
  const params = new URLSearchParams({ module });
  if (persona) params.set('persona', persona);
  const res = await fetch(`${API_URL}/cards?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
