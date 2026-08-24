import React, { useState } from 'react';
import { SubjectId, UserState, GameMode } from '../types';
import { SUBJECTS_CONFIG } from '../config/subjectsConfig';
import { SubjectMasteryEngine } from '../engines/SubjectMasteryEngine';
import { getStudyGuideByIdOrTopic } from '../data/studyGuidesData';
import {
  ArrowLeft,
  BookOpen,
  Zap,
  Target,
  Brain,
  Award,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Infinity,
} from 'lucide-react';

interface SubjectDetailScreenProps {
  subjectId: SubjectId;
  userState: UserState;
  onBack: () => void;
  onStartTopicGame: (options: {
    subjectId: SubjectId;
    topicId: string;
    gameMode: GameMode;
    count?: number;
  }) => void;
  onStartInfiniteTraining?: (subjectId: SubjectId, topicId?: string) => void;
  onOpenStudyGuide?: (guideIdOrTopic: string) => void;
}

export const SubjectDetailScreen: React.FC<SubjectDetailScreenProps> = ({
  subjectId,
  userState,
  onBack,
  onStartTopicGame,
  onStartInfiniteTraining,
  onOpenStudyGuide,
}) => {
  const subjectDef = SUBJECTS_CONFIG[subjectId];
  if (!subjectDef) return null;

  const subjectMastery = userState.subjectsMastery?.[subjectId];
  const masteryPercent = subjectMastery?.masteryPercent || 0;
  const skillLevel = subjectMastery?.skillLevel || 1;
  const questionsSolved = subjectMastery?.questionsSolved || 0;
  const accuracy = subjectMastery?.accuracy || 0;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 text-neutral-100 space-y-6">
      {/* Back button and title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${subjectDef.badgeBg} ${subjectDef.badgeBorder} ${subjectDef.badgeText}`}
            >
              {subjectDef.name}
            </span>
            <span className="text-xs text-neutral-400">Nível de Habilidade {skillLevel}/100</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">{subjectDef.name}</h1>
        </div>
      </div>

      {/* Overview Metric Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 block font-medium">Domínio da Matéria</span>
          <span className="text-2xl font-black text-amber-400 mt-1">{masteryPercent}%</span>
          <div className="w-full h-1 bg-neutral-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 block font-medium">Precisão Média</span>
          <span className="text-2xl font-black text-emerald-400 mt-1">{accuracy}%</span>
          <span className="text-xs text-neutral-500 block mt-1">Geral</span>
        </div>

        <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 block font-medium">Questões Feitas</span>
          <span className="text-2xl font-black text-purple-400 mt-1">{questionsSolved}</span>
          <span className="text-xs text-neutral-500 block mt-1">Resolvidas</span>
        </div>

        <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 block font-medium">Tópicos Ativos</span>
          <span className="text-2xl font-black text-blue-400 mt-1">{subjectDef.topics?.length || 0}</span>
          <span className="text-xs text-neutral-500 block mt-1">Estruturados</span>
        </div>
      </div>

      {/* Quick Launch Full Subject Session */}
      <div className="p-5 bg-gradient-to-r from-indigo-950/40 via-neutral-900 to-neutral-900 border border-indigo-500/30 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Infinity size={20} className="text-indigo-400" />
            Treino Infinito de {subjectDef.name}
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Sessão contínua com questões híbridas pré-carregadas, sem interrupção de tempo ou limite fixo.
          </p>
        </div>

        <button
          onClick={() => {
            if (onStartInfiniteTraining) {
              onStartInfiniteTraining(subjectId);
            } else {
              onStartTopicGame({
                subjectId,
                topicId: subjectDef.topics?.[0]?.id || 'geral',
                gameMode: 'quiz_rapido',
                count: 10,
              });
            }
          }}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-indigo-600/30 active:scale-95 whitespace-nowrap flex items-center justify-center gap-2"
        >
          <Zap size={16} />
          Treinar Matéria sem Fim
        </button>
      </div>

      {/* Topic List Breakdown */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers size={18} className="text-amber-400" />
          Tópicos e Conteúdos Programáticos
        </h2>

        <div className="space-y-2.5">
          {(subjectDef.topics || []).map((topic) => {
            if (!topic || !topic.id) return null;
            const topicMastery = subjectMastery?.topicMastery?.[topic.id];
            const topicPercent = topicMastery?.masteryPercent || 0;
            const topicTier = topicMastery?.tier || 'not_started';
            const tierLabel = SubjectMasteryEngine.getTierLabel(topicTier);
            const hasGuide = Boolean(getStudyGuideByIdOrTopic(topic.id));

            return (
              <div
                key={topic.id}
                className="p-4 bg-neutral-900/80 border border-neutral-800/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
              >
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-neutral-100">{topic.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400">
                      Peso {topic.weight || 3}/5
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">{topic.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400 block">{topicPercent}%</span>
                    <span className="text-xs text-neutral-500">{tierLabel}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasGuide && onOpenStudyGuide && (
                      <button
                        onClick={() => onOpenStudyGuide(topic.id)}
                        className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-indigo-300 font-bold text-xs transition-colors flex items-center gap-1"
                        title="Abrir Mini Apostila deste assunto"
                      >
                        <BookOpen size={14} />
                        <span className="hidden sm:inline">Apostila</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (onStartInfiniteTraining) {
                          onStartInfiniteTraining(subjectId, topic.id);
                        } else {
                          onStartTopicGame({
                            subjectId,
                            topicId: topic.id,
                            gameMode: 'quiz_rapido',
                            count: 8,
                          });
                        }
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-1"
                      title="Treinar Tópico"
                    >
                      <Zap size={14} />
                      Treinar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
