import React from 'react';
import type { EnglishProgress, EnglishSkill, EnglishSkillProgress } from '../../types';
import { EnglishLearningEngine } from '../../engines/EnglishLearningEngine';
import { EnglishVocabularyEngine } from '../../engines/EnglishVocabularyEngine';
import { BookOpen, Headphones, Mic, PenLine, Sparkles, Volume2 } from 'lucide-react';

export const EnglishPracticeCenter: React.FC<{
  progress: EnglishProgress;
  insights: string[];
  onStart: (kind: 'lesson' | 'review' | 'skill' | 'survival' | 'weakness' | 'vestibular', skill?: EnglishSkill) => void;
}> = ({ progress, insights, onStart }) => {
  const due = EnglishVocabularyEngine.stats(progress.vocabulary).due;
  const weakest = (Object.values(progress.skills) as EnglishSkillProgress[]).sort((a, b) => a.score - b.score)[0];
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-blue-500/30 bg-blue-950/20 p-4">
        <p className="text-xs font-black uppercase tracking-wider text-blue-300">Recommended For You</p>
        {insights[0] ? <p className="mt-2 text-sm text-white">{insights[0]}</p> : <p className="mt-2 text-sm text-neutral-300">Continue o curso para personalizar as recomendações.</p>}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Action icon={<Sparkles size={16} />} title="Quick Practice" onClick={() => onStart('lesson')} />
        <Action icon={<BookOpen size={16} />} title="Vocabulary Review" hint={`${due} due`} onClick={() => onStart('review')} />
        <Action icon={<PenLine size={16} />} title="Grammar Training" onClick={() => onStart('skill', 'grammar')} />
        <Action icon={<BookOpen size={16} />} title="Reading Training" onClick={() => onStart('skill', 'reading')} />
        <Action icon={<Headphones size={16} />} title="Listening Training" onClick={() => onStart('skill', 'listening')} />
        <Action icon={<Mic size={16} />} title="Speaking Training" onClick={() => onStart('skill', 'speaking')} />
        <Action icon={<PenLine size={16} />} title="Writing Training" onClick={() => onStart('skill', 'writing')} />
        <Action icon={<Volume2 size={16} />} title="Vestibular Training" onClick={() => onStart('vestibular')} />
        <Action icon={<Sparkles size={16} />} title="AI Recommended" hint={weakest ? EnglishLearningEngine.skillLabel(weakest.skill) : ''} onClick={() => onStart('weakness', weakest?.skill)} />
        <Action icon={<Sparkles size={16} />} title="English Survival" hint="3 vidas" onClick={() => onStart('survival')} />
      </div>
    </div>
  );
};

function Action({ icon, title, hint, onClick }: { icon: React.ReactNode; title: string; hint?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-16 items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900 px-4 text-left">
      <span className="flex items-center gap-2 text-sm font-bold text-white">{icon} {title}</span>
      {hint && <span className="text-xs text-blue-300">{hint}</span>}
    </button>
  );
}
