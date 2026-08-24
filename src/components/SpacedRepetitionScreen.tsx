import React from 'react';
import { UserState, EducationalQuestion } from '../types';
import { SpacedRepetitionEngine } from '../engines/SpacedRepetitionEngine';
import { SUBJECTS_CONFIG } from '../config/subjectsConfig';
import {
  ArrowLeft,
  Clock,
  BrainCircuit,
  Layers,
  Sparkles,
  Play,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface SpacedRepetitionScreenProps {
  userState: UserState;
  onBack: () => void;
  onStartReviewSession: (cards: any[]) => void;
}

export const SpacedRepetitionScreen: React.FC<SpacedRepetitionScreenProps> = ({
  userState,
  onBack,
  onStartReviewSession,
}) => {
  const stats = SpacedRepetitionEngine.getStats(userState);
  const dueCards = SpacedRepetitionEngine.getDueCards(userState, 20);

  const handleStartReview = () => {
    const questions = dueCards.map((c) => c?.question).filter(Boolean);
    onStartReviewSession(questions);
  };

  const BOX_INTERVALS = [
    { box: 1, interval: '1 dia', label: 'Iniciante' },
    { box: 2, interval: '2 dias', label: 'Em fixação' },
    { box: 3, interval: '4 dias', label: 'Intermediário' },
    { box: 4, interval: '7 dias', label: 'Consolidado' },
    { box: 5, interval: '15 dias', label: 'Memória de Longo Prazo' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 text-neutral-100 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
              Curva de Esquecimento (SRS)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Repetição Espaçada</h1>
        </div>
      </div>

      {/* Hero Review Card */}
      <div className="p-6 bg-gradient-to-br from-blue-950/40 via-neutral-900 to-neutral-900 border border-blue-500/30 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-lg">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Clock size={16} /> Fila do Dia
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {stats.dueTodayCount} {stats.dueTodayCount === 1 ? 'card para revisar' : 'cards para revisar'} hoje
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Revisões automáticas no momento ideal para transferir o conteúdo da memória de curto prazo para a de longo prazo.
          </p>
        </div>

        {stats.dueTodayCount > 0 ? (
          <button
            onClick={handleStartReview}
            className="px-6 py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 text-neutral-950 font-bold text-base transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Play size={18} /> Iniciar Revisão do Dia
          </button>
        ) : (
          <div className="px-5 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={16} /> Todas as revisões em dia!
          </div>
        )}
      </div>

      {/* Leitner Box Hierarchy */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Layers size={18} className="text-amber-400" />
          Distribuição nas Caixas de Leitner
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {BOX_INTERVALS.map((item) => {
            const count = stats.byBox[item.box] || 0;
            return (
              <div
                key={item.box}
                className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-2xl text-center space-y-1.5"
              >
                <span className="text-xs text-neutral-500 font-bold">Caixa {item.box}</span>
                <div className="text-2xl font-black text-white">{count}</div>
                <div className="text-xs text-amber-400 font-semibold">{item.interval}</div>
                <span className="text-[10px] text-neutral-400 block">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
