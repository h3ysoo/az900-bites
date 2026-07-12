import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from './api';

interface Props {
  card: Card;
  distractors: string[];
  onClose: () => void;
  onAnswer: (correct: boolean) => void;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function QuizModal({ card, distractors, onClose, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const options = useMemo(
    () => shuffle([card.quiz_answer, ...distractors.slice(0, 2)]),
    [card.id]
  );
  const isCorrect = selected === card.quiz_answer;

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.question}>{card.quiz_question}</Text>
          {options.map((option) => {
            const chosen = selected === option;
            const showState = selected !== null && (chosen || option === card.quiz_answer);
            return (
              <Pressable
                key={option}
                disabled={selected !== null}
                onPress={() => {
                  setSelected(option);
                  onAnswer(option === card.quiz_answer);
                }}
                style={[
                  styles.option,
                  showState &&
                    (option === card.quiz_answer ? styles.correct : styles.wrong),
                ]}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            );
          })}
          {selected !== null && (
            <Text style={[styles.feedback, { color: isCorrect ? '#4ade80' : '#f87171' }]}>
              {isCorrect ? 'Doğru! 🎉' : 'Yanlış — doğru cevap yeşille işaretli.'}
            </Text>
          )}
          <Pressable onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>Kapat</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  question: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  option: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  correct: { backgroundColor: '#166534' },
  wrong: { backgroundColor: '#7f1d1d' },
  optionText: { color: '#e2e8f0', fontSize: 15 },
  feedback: { fontSize: 16, fontWeight: '600', marginTop: 6 },
  close: { alignSelf: 'center', marginTop: 16, padding: 8 },
  closeText: { color: '#94a3b8', fontSize: 15 },
});
