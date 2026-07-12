import AsyncStorage from '@react-native-async-storage/async-storage';

// Seen cards are stored per module (across personas), keyed by card id.
const storageKey = (module: string) => `seen:${module}`;

export async function loadSeen(module: string): Promise<Set<number>> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(module));
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
}

export async function saveSeen(module: string, seen: Set<number>): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(module), JSON.stringify([...seen]));
  } catch {
    // Persistence is best-effort; the in-memory state still works.
  }
}
