import React from 'react';
import type { EnglishProgress, EnglishSkill } from '../../types';
import { EnglishLearningEngine } from '../../engines/EnglishLearningEngine';
import { EnglishCEFRManager } from '../../engines/EnglishCEFRManager';

const SKILLS: EnglishSkill[] = ['vocabulary', 'grammar', 'reading', 'listening', 'writing', 'speaking'];

export const EnglishSkillsPanel: React.FC<{
  progress: EnglishProgress;
  onPractice: (skill: EnglishSkill) => void;
}> = ({ progress, onPractice }) => {
  const weakest = [...SKILLS].sort((a, b) => progress.skills[a].score - progress.skills[b].score)[0];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SKILLS.map((skill) => {
          const data = progress.skills[skill];
          const needsAttention = skill === weakest && data.activities >= 3;
          return (
            <div key={skill} className={`rounded-2xl border p-3 ${needsAttention ? 'border-amber-400/50 bg-amber-500/10' : 'border-neutral-800 bg-neutral-900'}`}>
              <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">{EnglishLearningEngine.skillLabel(skill)}</p>
              <p className="text-2xl font-black text-white">{Math.round(data.score)}%</p>
              <p className="text-[10px] text-neutral-500">
                {EnglishCEFRManager.label(data.estimatedCefr)} · confiança {Math.round(data.confidence * 100)}%
              </p>
              {needsAttention && <p className="mt-1 text-[10px] font-bold text-amber-300">Needs Attention</p>}
              <button type="button" onClick={() => onPractice(skill)} className="mt-2 min-h-10 w-full rounded-xl bg-blue-600 text-xs font-black text-white">
                PRACTICE
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
