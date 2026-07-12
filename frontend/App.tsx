import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import CardFeed from './src/CardFeed';
import { Card, fetchCards } from './src/api';
import { PERSONAS, PERSONA_LABELS } from './src/personas';
import { loadSeen, saveSeen } from './src/progress';

const MODULES = [
  'Cloud Concepts',
  'Architecture & Management',
  'Pricing & Support',
];

function Main() {
  const insets = useSafeAreaInsets();
  const [module, setModule] = useState(MODULES[0]);
  const [persona, setPersona] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedHeight, setFeedHeight] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setCards([]);
    setSeen(new Set());
    setScore({ correct: 0, wrong: 0 });
    Promise.all([fetchCards(module, persona ?? undefined), loadSeen(module)])
      .then(([data, stored]) => {
        if (cancelled) return;
        setCards(data);
        // The first card is on screen immediately; viewability on web can
        // fire late, so count it as seen right away.
        if (data.length > 0) stored.add(data[0].id);
        setSeen(stored);
        saveSeen(module, stored);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [module, persona]);

  const onQuizAnswer = useCallback((correct: boolean) => {
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
    }));
  }, []);

  const onSeen = useCallback(
    (cardId: number) => {
      setSeen((prev) => {
        if (prev.has(cardId)) return prev;
        const next = new Set(prev);
        next.add(cardId);
        saveSeen(module, next);
        return next;
      });
    },
    [module]
  );

  // The stored set covers the whole module; only count cards in the
  // currently filtered list.
  const seenCount = cards.filter((c) => seen.has(c.id)).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <Text style={styles.title}>AZ-900 Bites</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        contentContainerStyle={styles.chipRowContent}
      >
        {MODULES.map((m) => (
          <Pressable
            key={m}
            onPress={() => setModule(m)}
            style={[styles.chip, module === m && styles.chipActive]}
          >
            <Text style={[styles.chipText, module === m && styles.chipTextActive]}>
              {m}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.personaRow}
        contentContainerStyle={styles.chipRowContent}
      >
        {[null, ...PERSONAS].map((p) => (
          <Pressable
            key={p ?? 'all'}
            onPress={() => setPersona(p)}
            style={[styles.personaChip, persona === p && styles.personaChipActive]}
          >
            <Text
              style={[styles.chipText, persona === p && styles.chipTextActive]}
            >
              {p ? PERSONA_LABELS[p] : 'All'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {cards.length > 0 && (
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(seenCount / cards.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {seenCount}/{cards.length}
          </Text>
          {score.correct + score.wrong > 0 && (
            <Text style={styles.scoreText}>
              ✅{score.correct} ❌{score.wrong}
            </Text>
          )}
        </View>
      )}
      <View
        style={styles.feed}
        onLayout={(e) => setFeedHeight(e.nativeEvent.layout.height)}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#38bdf8" style={styles.center} />
        ) : error ? (
          <Text style={styles.message}>
            Couldn't reach the API.{'\n'}Make sure the backend is running and
            on the same network as your phone.{'\n\n'}{error}
          </Text>
        ) : cards.length === 0 ? (
          <Text style={styles.message}>
            No cards for this module yet. Coming soon! 🚧
          </Text>
        ) : feedHeight > 0 ? (
          <CardFeed
            cards={cards}
            height={feedHeight}
            onSeen={onSeen}
            onQuizAnswer={onQuizAnswer}
          />
        ) : null}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  title: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  chipRow: { flexGrow: 0 },
  chipRowContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  personaRow: { flexGrow: 0, marginTop: 8 },
  personaChip: {
    borderRadius: 999,
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  personaChipActive: { backgroundColor: '#38bdf8' },
  chipText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1e293b',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38bdf8',
  },
  progressText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  scoreText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  feed: { flex: 1, marginTop: 4 },
  center: { flex: 1 },
  message: {
    color: '#94a3b8',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    padding: 32,
    marginTop: 60,
  },
});
