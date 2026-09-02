import React, { useState } from 'react';
import type { ErrorNotebookEntry, UserState } from '../../types';
import { localTeacherReply } from '../../data/english/englishConversation';
import { EnglishLearningEngine } from '../../engines/EnglishLearningEngine';
import { EnglishSkillMasteryEngine } from '../../engines/EnglishSkillMasteryEngine';
import { ApiClient } from '../../services/apiClient';
import { EnglishCEFRManager } from '../../engines/EnglishCEFRManager';

const ACTIONS = [
  { id: 'explain_mistake', label: 'Explain my last mistake' },
  { id: 'grammar', label: 'Give me a grammar exercise' },
  { id: 'vocab', label: 'Practice vocabulary' },
  { id: 'test', label: 'Test me' },
  { id: 'sentence', label: 'Explain this sentence' },
  { id: 'why', label: 'Why is this answer wrong?' },
];

export const EnglishAITeacherScreen: React.FC<{ userState: UserState }> = ({ userState }) => {
  const progress = EnglishLearningEngine.ensureProgress(userState).englishProgress!;
  const weak = EnglishSkillMasteryEngine.weakestSkill(progress.skills);
  const lastMistake = (Object.values(userState.errorNotebook || {}) as ErrorNotebookEntry[])
    .filter((entry) => entry.subjectId === 'ingles')
    .sort((a, b) => b.lastReviewedAt - a.lastReviewedAt)[0];
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [fallback, setFallback] = useState(false);

  const ask = async (action: string) => {
    setBusy(true);
    const payload = {
      action,
      cefr: progress.estimatedCefr,
      weakSkill: weak?.skill,
      lastMistake: lastMistake ? `${lastMistake.questionPrompt} → ${lastMistake.correctAnswer}` : undefined,
    };
    try {
      const remote = await ApiClient.englishTeacher(payload);
      setReply(remote.text || localTeacherReply(payload));
      setFallback(Boolean(remote.fallback));
    } catch {
      setReply(localTeacherReply(payload));
      setFallback(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-400">
        Professora de Inglês usa seu {EnglishCEFRManager.estimatedLabel(progress.estimatedCefr)}, habilidades e caderno de erros. Sem chave de API no frontend. Se a IA estiver offline, o curso continua com explicações locais.
      </p>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <button key={action.id} type="button" disabled={busy} onClick={() => ask(action.id)} className="min-h-11 rounded-full border border-blue-500/30 px-3 text-xs font-bold text-blue-100">
            {action.label}
          </button>
        ))}
      </div>
      {fallback && <p className="text-xs text-amber-300">Resposta local — configure a IA no servidor quando quiser explicações generativas.</p>}
      {reply && <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4 text-sm leading-relaxed text-neutral-100">{reply}</div>}
    </div>
  );
};
