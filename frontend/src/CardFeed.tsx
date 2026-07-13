import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { Card } from './api';
import { personaLabel } from './personas';
import QuizModal from './QuizModal';

interface Props {
  cards: Card[];
  height: number;
  onSeen: (cardId: number) => void;
  onQuizAnswer: (correct: boolean) => void;
}

export default function CardFeed({ cards, height, onSeen, onQuizAnswer }: Props) {
  const [quizCard, setQuizCard] = useState<Card | null>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      viewableItems.forEach((item) => {
        if (item.isViewable && item.item) onSeen((item.item as Card).id);
      });
    }
  ).current;

  const renderItem = useCallback(
    ({ item }: { item: Card }) => (
      <View style={[styles.card, { height }]}>
        <Text style={styles.persona}>{personaLabel(item.persona)}</Text>
        <Text style={styles.topic}>{item.topic}</Text>
        <Text style={styles.content}>{item.content}</Text>
        <Pressable style={styles.quizButton} onPress={() => setQuizCard(item)}>
          <Text style={styles.quizButtonText}>🎯 Quiz</Text>
        </Pressable>
      </View>
    ),
    [height]
  );

  return (
    <>
      <FlatList
        data={cards}
        keyExtractor={(card) => String(card.id)}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
      />
      {quizCard && (
        <QuizModal
          card={quizCard}
          distractors={cards
            .filter((c) => c.id !== quizCard.id)
            .map((c) => c.quiz_answer)
            .sort(() => Math.random() - 0.5)}
          onClose={() => setQuizCard(null)}
          onAnswer={onQuizAnswer}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 28,
    justifyContent: 'center',
  },
  persona: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  topic: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  content: {
    color: '#f8fafc',
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '500',
  },
  quizButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0ea5e9',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 28,
  },
  quizButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
