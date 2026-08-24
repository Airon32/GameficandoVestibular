import React, { useState } from 'react';
import { UserState, SubjectId, ErrorNotebookEntry, GameMode } from '../types';
import { ErrorNotebookEngine } from '../engines/ErrorNotebookEngine';
import { SUBJECTS_CONFIG } from '../config/subjectsConfig';
import { QuestionBankService } from '../data/questionBank';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  BookOpen,
  Filter,
  Check,
  Zap,
} from 'lucide-react';

interface ErrorNotebookScreenProps {
  userState: UserState;
  onBack: () => void;
  onStartRecoveryMode: (questions: any[]) => void;
  onMarkErrorRecovered: (questionId: string) => void;
}

export const ErrorNotebookScreen: React.FC<ErrorNotebookScreenProps> = ({
  userState,
  onBack,
  onStartRecoveryMode,
  onMarkErrorRecovered,
}) => {
  const [filterSubject, setFilterSubject] = useState<SubjectId | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'recovered'>('all');

  const stats = ErrorNotebookEngine.getStats(userState);
  const notebookEntries: ErrorNotebookEntry[] = Object.values(userState.errorNotebook || {}) as ErrorNotebookEntry[];

  // Filter entries
  const filtered = notebookEntries.filter((entry: ErrorNotebookEntry) => {
    if (filterSubject !== 'all' && entry.subjectId !== filterSubject) return false;
    if (filterStatus === 'pending' && entry.status === 'recovered') return false;
    if (filterStatus === 'recovered' && entry.status !== 'recovered') return false;
    return true;
  });

  const handleStartRecovery = () => {
    const pendingQuestions = filtered
      .filter((e) => e.status !== 'recovered')
      .map((e) => QuestionBankService.getQuestionById(e.questionId))
      .filter(Boolean);

    if (pendingQuestions.length > 0) {
      onStartRecoveryMode(pendingQuestions);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 text-neutral-100 space-y-6">
      {/* Header and Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
              Ferramenta de Alta Retenção
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Caderno de Erros</h1>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 block font-medium">Erros Registrados</span>
          <span className="text-2xl font-black text-white mt-1">{stats.totalErrors}</span>
        </div>

        <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 block font-medium">Pendentes</span>
          <span className="text-2xl font-black text-rose-400 mt-1">{stats.pendingCount}</span>
        </div>

        <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 block font-medium">Erros Superados</span>
          <span className="text-2xl font-black text-emerald-400 mt-1">{stats.recoveredCount}</span>
        </div>

        <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 block font-medium">Taxa de Superação</span>
          <span className="text-2xl font-black text-amber-400 mt-1">{stats.recoveryRatePercent}%</span>
        </div>
      </div>

      {/* Action Banner */}
      {stats.pendingCount > 0 && (
        <div className="p-5 bg-gradient-to-r from-rose-500/10 via-neutral-900 to-neutral-900 border border-rose-500/30 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw size={18} className="text-rose-400" />
              Modo Recuperação de Erros
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Refaça as {stats.pendingCount} questões que você errou anteriormente até fixar o aprendizado.
            </p>
          </div>

          <button
            onClick={handleStartRecovery}
            className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-neutral-950 font-bold text-sm transition-all shadow-md shadow-rose-500/20 active:scale-95 whitespace-nowrap"
          >
            Refazer Meus Erros Agora
          </button>
        </div>
      )}

      {/* Filters and List */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-amber-400" />
            Lista de Questões Registradas ({filtered.length})
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterStatus === 'all'
                  ? 'bg-neutral-800 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilterStatus('recovered')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterStatus === 'recovered'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              Superados
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-3xl text-center space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
            <h3 className="text-base font-bold text-white">Nenhum erro encontrado neste filtro</h3>
            <p className="text-xs text-neutral-400">
              Continue realizando treinos e simulados. Seus erros serão salvos aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry) => {
              const subDef = SUBJECTS_CONFIG[entry.subjectId];
              return (
                <div
                  key={entry.questionId}
                  className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {subDef && (
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-lg font-bold border ${subDef.badgeBg} ${subDef.badgeBorder} ${subDef.badgeText}`}
                        >
                          {subDef.name}
                        </span>
                      )}
                      <span className="text-xs text-neutral-400 font-medium">{entry.topicId}</span>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-lg font-bold ${
                        entry.status === 'recovered'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {entry.status === 'recovered' ? 'Superado ✓' : 'Pendente'}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-neutral-200">{entry.questionPrompt}</p>

                  <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800/80 text-xs space-y-1.5">
                    <div className="text-neutral-400">
                      <span className="text-rose-400 font-semibold">Sua resposta anterior:</span>{' '}
                      {String(entry.userLastWrongAnswer)}
                    </div>
                    <div className="text-neutral-300">
                      <span className="text-emerald-400 font-semibold">Explicação do conceito:</span>{' '}
                      {entry.explanation}
                    </div>
                  </div>

                  {entry.status !== 'recovered' && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onMarkErrorRecovered(entry.questionId)}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 flex items-center gap-1.5 transition-colors"
                      >
                        <Check size={14} className="text-emerald-400" /> Marcar como Entendido
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
