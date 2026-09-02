import React, { useState } from 'react';
import type { CEFRLevel, EnglishSkill, UserState } from '../../types';
import { ENGLISH_PLACEMENT_ITEMS, placementToCefr } from '../../data/english/englishPlacement';
import { EnglishLearningEngine } from '../../engines/EnglishLearningEngine';
import { EnglishExerciseRenderer } from './EnglishExerciseRenderer';
import { EnglishCEFRManager } from '../../engines/EnglishCEFRManager';

export const EnglishPlacementTest: React.FC<{
  userState: UserState;
  onFinish: (state: UserState) => void;
  onSkip: () => void;
}> = ({ userState, onFinish, onSkip }) => {
  const [index, setIndex] = useState(0);
  const [byCefr, setByCefr] = useState<Record<string, { correct: number; total: number }>>({});
  const [bySkill, setBySkill] = useState<Partial<Record<EnglishSkill, { correct: number; total: number }>>>({});
  const item = ENGLISH_PLACEMENT_ITEMS[index];

  const complete = (finalCefr: typeof byCefr, finalSkills: typeof bySkill) => {
    const overall = placementToCefr(finalCefr);
    const skills: Partial<Record<EnglishSkill, CEFRLevel | 'unevaluated'>> = {};
    (Object.entries(finalSkills) as Array<[EnglishSkill, { correct: number; total: number }]>).forEach(([skill, row]) => {
      skills[skill] = row.total === 0 ? 'unevaluated' : placementToCefr({ [overall]: row });
    });
    skills.writing = 'unevaluated';
    skills.speaking = 'unevaluated';
    onFinish(EnglishLearningEngine.applyPlacement(userState, overall, skills, false));
  };

  if (!item) {
    return null;
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-blue-300">Teste de nível opcional</p>
      <h2 className="text-2xl font-black text-white">Estimated English Level</h2>
      <p className="text-sm text-neutral-400">
        Questão {index + 1} de {ENGLISH_PLACEMENT_ITEMS.length}. Writing e Speaking não são avaliados neste teste.
      </p>
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
        <p className="mb-3 text-sm font-semibold text-white">{item.question.prompt}</p>
        <EnglishExerciseRenderer
          question={item.question}
          onSubmit={(answer) => {
            const correct = EnglishLearningEngine.evaluateQuestion(item.question, answer);
            const nextCefr = {
              ...byCefr,
              [item.cefr]: {
                correct: (byCefr[item.cefr]?.correct || 0) + (correct ? 1 : 0),
                total: (byCefr[item.cefr]?.total || 0) + 1,
              },
            };
            const nextSkills = {
              ...bySkill,
              [item.skill]: {
                correct: (bySkill[item.skill]?.correct || 0) + (correct ? 1 : 0),
                total: (bySkill[item.skill]?.total || 0) + 1,
              },
            };
            setByCefr(nextCefr);
            setBySkill(nextSkills);
            if (index + 1 >= ENGLISH_PLACEMENT_ITEMS.length) complete(nextCefr, nextSkills);
            else setIndex((value) => value + 1);
          }}
        />
      </div>
      <button type="button" onClick={onSkip} className="min-h-11 w-full text-sm text-neutral-400">
        Começar do início
      </button>
      <p className="text-xs text-neutral-500">Isso não é uma certificação oficial. O resultado é um {EnglishCEFRManager.estimatedLabel('a2').replace('A2', 'nível estimado')}.</p>
    </div>
  );
};
