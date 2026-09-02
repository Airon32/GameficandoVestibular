import React from 'react';
import type { CEFRLevel, EnglishSkill, EnglishUnitStatus } from '../../types';
import { ENGLISH_COURSE } from '../../data/english/englishCourse';
import { Check, Flag, Lock, MapPin, Sparkles, Swords } from 'lucide-react';

export interface EnglishMapNode {
  unitId: string;
  title: string;
  cefr: CEFRLevel;
  island: string;
  status: EnglishUnitStatus;
  track: string;
}

const STATUS_LABEL: Record<EnglishUnitStatus, string> = {
  locked: 'Bloqueada',
  available: 'Disponível',
  current: 'Atual',
  completed: 'Concluída',
  mastered: 'Dominada',
  review: 'Revisão',
  boss: 'Desafio',
};

export const EnglishCourseMap: React.FC<{
  nodes: EnglishMapNode[];
  onOpenUnit: (unitId: string) => void;
}> = ({ nodes, onOpenUnit }) => {
  return (
    <div className="space-y-6">
      {ENGLISH_COURSE.map((level) => {
        const levelNodes = nodes.filter((node) => node.cefr === level.id);
        return (
          <section key={level.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-blue-200">{level.island}</h3>
              <span className="text-xs text-neutral-500">{level.title}</span>
            </div>
            <ol className="relative ml-3 space-y-3 border-l border-blue-500/30 pl-5">
              {levelNodes.map((node) => {
                const locked = node.status === 'locked';
                return (
                  <li key={node.unitId}>
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => onOpenUnit(node.unitId)}
                      className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left ${
                        node.status === 'current'
                          ? 'border-blue-400 bg-blue-500/15'
                          : node.status === 'mastered'
                            ? 'border-emerald-500/40 bg-emerald-500/10'
                            : locked
                              ? 'border-neutral-800 bg-neutral-950/60 opacity-70'
                              : 'border-neutral-800 bg-neutral-900'
                      }`}
                      aria-label={`${node.title}. ${STATUS_LABEL[node.status]}`}
                    >
                      <div>
                        <p className="text-sm font-black text-white">{node.title}</p>
                        <p className="text-[11px] text-neutral-400">
                          {node.cefr.toUpperCase()} · {node.track === 'vestibular' ? 'English for Vestibular' : 'English for Life'} · {STATUS_LABEL[node.status]}
                        </p>
                      </div>
                      {locked ? <Lock size={16} /> : node.status === 'mastered' ? <Sparkles size={16} className="text-emerald-400" /> : node.status === 'boss' ? <Swords size={16} className="text-amber-400" /> : node.status === 'completed' ? <Check size={16} className="text-blue-300" /> : <Flag size={16} className="text-blue-400" />}
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
};
