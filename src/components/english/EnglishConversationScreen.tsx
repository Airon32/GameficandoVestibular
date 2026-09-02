import React, { useState } from 'react';
import type { UserState } from '../../types';
import { ENGLISH_SCENARIOS, localConversationReply } from '../../data/english/englishConversation';
import { EnglishLearningEngine } from '../../engines/EnglishLearningEngine';
import { ApiClient } from '../../services/apiClient';

export const EnglishConversationScreen: React.FC<{
  userState: UserState;
  onUpdate: (state: UserState) => void;
  onBack: () => void;
}> = ({ userState, onUpdate, onBack }) => {
  const [scenario, setScenario] = useState<(typeof ENGLISH_SCENARIOS)[number] | null>(null);
  const [learningMode, setLearningMode] = useState(true);
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);

  const send = async () => {
    if (!scenario || !input.trim()) return;
    const userText = input.trim();
    setInput('');
    setTurns((current) => [...current, { role: 'user', text: userText }]);
    setBusy(true);
    try {
      const remote = await ApiClient.englishConversation({
        scenario: scenario.id,
        userText,
        learningMode,
        cefr: userState.englishProgress?.estimatedCefr || 'a0',
      });
      const reply = remote.text || localConversationReply(scenario.id, userText, learningMode);
      setTurns((current) => [...current, { role: 'ai', text: reply }]);
      setOffline(Boolean(remote.fallback));
    } catch {
      setTurns((current) => [...current, { role: 'ai', text: localConversationReply(scenario.id, userText, learningMode) }]);
      setOffline(true);
    } finally {
      setBusy(false);
    }
  };

  const finish = () => {
    if (!scenario) return;
    onUpdate(
      EnglishLearningEngine.recordConversationSummary(userState, {
        id: `conv_${Date.now()}`,
        scenario: scenario.title,
        completedAt: Date.now(),
        grammar: 70,
        vocabulary: 68,
        naturalness: learningMode ? 62 : 74,
        fluency: 65,
        newWords: [],
        mistakes: turns.filter((turn) => turn.role === 'ai' && turn.text.includes('Learning note')).map((turn) => turn.text),
      })
    );
    onBack();
  };

  if (!scenario) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-neutral-400">Real-life conversations. A IA assume o personagem; o curso continua funcionando se a IA estiver offline.</p>
        {ENGLISH_SCENARIOS.map((item) => (
          <button key={item.id} type="button" onClick={() => setScenario(item)} className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-left">
            <p className="font-black text-white">{item.title}</p>
            <p className="text-xs text-neutral-400">{item.prompt}</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => setLearningMode(true)} className={`min-h-10 rounded-xl px-3 text-xs font-bold ${learningMode ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400'}`}>
          Learning Mode
        </button>
        <button type="button" onClick={() => setLearningMode(false)} className={`min-h-10 rounded-xl px-3 text-xs font-bold ${!learningMode ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400'}`}>
          Natural Conversation
        </button>
      </div>
      {offline && <p className="text-xs text-amber-300">IA indisponível — usando diálogo local.</p>}
      <div className="max-h-[50vh] space-y-2 overflow-y-auto rounded-3xl border border-neutral-800 bg-neutral-950 p-3">
        <p className="text-xs text-blue-300">{scenario.prompt}</p>
        {turns.map((turn, index) => (
          <p key={`${turn.role}-${index}`} className={`rounded-2xl p-3 text-sm ${turn.role === 'user' ? 'bg-blue-600/20 text-white' : 'bg-neutral-900 text-neutral-200'}`}>
            {turn.text}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(event) => setInput(event.target.value)} className="min-h-12 flex-1 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 text-sm text-white" placeholder="Your reply" />
        <button type="button" disabled={busy} onClick={send} className="min-h-12 rounded-2xl bg-blue-600 px-4 font-black text-white">
          Send
        </button>
      </div>
      <button type="button" onClick={finish} className="min-h-11 w-full text-sm font-bold text-neutral-300">
        Encerrar e ver relatório
      </button>
    </div>
  );
};
