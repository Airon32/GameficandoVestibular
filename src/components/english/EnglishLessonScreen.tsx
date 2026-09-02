import React, { useEffect, useRef, useState } from 'react';
import type { EducationalQuestion, UserState } from '../../types';
import { EnglishLearningEngine } from '../../engines/EnglishLearningEngine';
import { EnglishExerciseRenderer, EnglishFeedback, EnglishWhyButton } from './EnglishExerciseRenderer';
import { ArrowLeft } from 'lucide-react';

interface EnglishLessonScreenProps {
  title: string;
  questions: EducationalQuestion[];
  userState: UserState;
  lives?: number;
  onUpdate: (state: UserState) => void;
  onComplete: (result: {
    accuracy: number;
    xpEarned: number;
    correct: number;
    total: number;
    combo: number;
    mistakes: EducationalQuestion[];
    state: UserState;
  }) => void;
  onExit: () => void;
}

export const EnglishLessonScreen: React.FC<EnglishLessonScreenProps> = ({
  title,
  questions,
  userState,
  lives,
  onUpdate,
  onComplete,
  onExit,
}) => {
  const [index, setIndex] = useState(0);
  const [remainingLives, setRemainingLives] = useState(lives ?? 99);
  const [xpEarned, setXpEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [mistakes, setMistakes] = useState<EducationalQuestion[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; why: string; sentence?: string } | null>(null);
  const startedAt = useRef(Date.now());
  const stateRef = useRef(userState);
  stateRef.current = userState;
  const reduceMotion = userState.settings?.reduceMotion;

  const question = questions[index];

  useEffect(() => {
    startedAt.current = Date.now();
    setFeedback(null);
  }, [index, question?.id]);

  if (!question) {
    return (
      <div className="p-6 text-sm text-neutral-300">
        Nenhuma questão nesta sessão.{' '}
        <button type="button" className="underline" onClick={onExit}>
          Voltar
        </button>
      </div>
    );
  }

  const finish = (finalXp: number, finalCorrect: number, finalMistakes: EducationalQuestion[], combo: number) => {
    const total = questions.length;
    onComplete({
      accuracy: Math.round((finalCorrect / Math.max(1, total)) * 100),
      xpEarned: finalXp,
      correct: finalCorrect,
      total,
      combo,
      mistakes: finalMistakes,
      state: stateRef.current,
    });
  };

  const handleSubmit = (answer: unknown) => {
    if (feedback) return;
    const elapsed = Date.now() - startedAt.current;
    const result = EnglishLearningEngine.applyAnswer(stateRef.current, question, answer, elapsed);
    stateRef.current = result.state;
    onUpdate(result.state);
    const sentence = question.questionType === 'ordering'
      ? [...question.items].sort((a, b) => a.correctOrder - b.correctOrder).map((item) => item.text).join(' ')
      : question.questionType === 'fill_blank'
        ? question.correctAnswers[0]
        : undefined;
    setFeedback({ correct: result.isCorrect, why: result.why, sentence });
    const nextXp = xpEarned + result.xpEarned;
    const nextCorrect = correctCount + (result.isCorrect ? 1 : 0);
    const nextCombo = Math.max(bestCombo, result.state.combo);
    const nextMistakes = result.isCorrect ? mistakes : [...mistakes, question];
    setXpEarned(nextXp);
    setCorrectCount(nextCorrect);
    setBestCombo(nextCombo);
    setMistakes(nextMistakes);
    if (!result.isCorrect && lives !== undefined) {
      const nextLives = remainingLives - 1;
      setRemainingLives(nextLives);
      if (nextLives <= 0) {
        finish(nextXp, nextCorrect, nextMistakes, nextCombo);
      }
    }
  };

  const goNext = () => {
    if (index + 1 >= questions.length) {
      finish(xpEarned, correctCount, mistakes, bestCombo);
      return;
    }
    setIndex((value) => value + 1);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-3 sm:p-5">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onExit} className="min-h-11 min-w-11 rounded-2xl border border-neutral-800" aria-label="Sair da lição">
          <ArrowLeft className="mx-auto" size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold uppercase tracking-wider text-blue-300">{title}</p>
          <p className="text-xs text-neutral-400">
            {index + 1}/{questions.length} · +{xpEarned} XP
            {lives !== undefined ? ` · ${remainingLives} vidas` : ''}
          </p>
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
        <div className="h-full bg-blue-500" style={{ width: `${((index + (feedback ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4 sm:p-6">
        <p className="mb-4 text-base font-semibold text-white">{question.prompt}</p>
        <EnglishExerciseRenderer question={question} disabled={Boolean(feedback)} onSubmit={handleSubmit} />
      </div>
      {feedback && (
        <div className="space-y-3">
          <EnglishFeedback correct={feedback.correct} sentence={feedback.sentence} />
          <EnglishWhyButton explanation={feedback.why} reduceMotion={reduceMotion} />
          <button type="button" onClick={goNext} className="min-h-12 w-full rounded-2xl bg-blue-600 font-black text-white">
            Continuar
          </button>
        </div>
      )}
    </div>
  );
};
