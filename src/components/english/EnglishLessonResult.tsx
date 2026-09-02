import React from 'react';
import type { EducationalQuestion } from '../../types';

export const EnglishLessonResult: React.FC<{
  title?: string;
  xpEarned: number;
  accuracy: number;
  combo: number;
  timeLabel?: string;
  wordsLearned?: number;
  mistakes: EducationalQuestion[];
  skillNote?: string;
  onContinue: () => void;
  onReviewMistakes: () => void;
}> = ({ title = 'LESSON COMPLETE', xpEarned, accuracy, combo, timeLabel, wordsLearned = 0, mistakes, skillNote, onContinue, onReviewMistakes }) => {
  return (
    <div className="mx-auto w-full max-w-lg space-y-4 p-4">
      <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/50 to-neutral-950 p-6 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">{title}</p>
        <p className="mt-2 text-3xl font-black text-white">+{xpEarned} XP</p>
        <p className="mt-1 text-xs text-neutral-400">XP real emitido pelo sistema global</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Best Combo" value={String(combo)} />
        <Stat label="Time" value={timeLabel || '—'} />
        <Stat label="Words" value={String(wordsLearned)} />
      </div>
      {skillNote && <p className="text-sm text-neutral-300">{skillNote}</p>}
      {mistakes.length > 0 && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-3 text-sm text-rose-100">
          {mistakes.length} erro(s) foram para o Caderno de Erros.
        </div>
      )}
      <button type="button" onClick={onContinue} className="min-h-12 w-full rounded-2xl bg-blue-600 font-black text-white">
        Continue
      </button>
      {mistakes.length > 0 && (
        <button type="button" onClick={onReviewMistakes} className="min-h-12 w-full rounded-2xl border border-neutral-700 font-bold text-white">
          Review Mistakes
        </button>
      )}
    </div>
  );
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <p className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
}
