import React, { lazy, Suspense, useMemo, useState } from 'react';
import type { EducationalQuestion, EnglishSkill, UserState } from '../../types';
import { EnglishLearningEngine } from '../../engines/EnglishLearningEngine';
import { EnglishCEFRManager } from '../../engines/EnglishCEFRManager';
import { EnglishVocabularyEngine } from '../../engines/EnglishVocabularyEngine';
import { EnglishCourseMap } from './EnglishCourseMap';
import { EnglishLessonScreen } from './EnglishLessonScreen';
import { EnglishLessonResult } from './EnglishLessonResult';
import { EnglishSkillsPanel } from './EnglishSkillsPanel';
import { EnglishVocabularyScreen } from './EnglishVocabularyScreen';
import { EnglishPlacementTest } from './EnglishPlacementTest';
import { EnglishPracticeCenter } from './EnglishPracticeCenter';
import { getUnitById } from '../../data/english/englishCourse';
import { RankBadge } from '../RankBadge';
import {
  ArrowLeft,
  BookOpen,
  Flame,
  Languages,
  Map,
  MessageCircle,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';

const EnglishConversationScreen = lazy(() => import('./EnglishConversationScreen').then((mod) => ({ default: mod.EnglishConversationScreen })));
const EnglishAITeacherScreen = lazy(() => import('./EnglishAITeacherScreen').then((mod) => ({ default: mod.EnglishAITeacherScreen })));

type HubView =
  | 'hub'
  | 'map'
  | 'lesson'
  | 'result'
  | 'vocab'
  | 'placement'
  | 'practice'
  | 'conversation'
  | 'teacher'
  | 'mistakes';

interface SessionConfig {
  title: string;
  kind: 'lesson' | 'review' | 'skill' | 'survival' | 'boss';
  questions: EducationalQuestion[];
  lessonId?: string;
  lives?: number;
}

export const EnglishHubScreen: React.FC<{
  userState: UserState;
  onUpdate: (state: UserState) => void;
  onBack: () => void;
  onOpenVestibular: () => void;
  onOpenNotebook: () => void;
  onImmersiveChange?: (immersive: boolean) => void;
}> = ({ userState, onUpdate, onBack, onOpenVestibular, onOpenNotebook, onImmersiveChange }) => {
  const ready = EnglishLearningEngine.ensureProgress(userState);
  const progress = ready.englishProgress!;
  const [view, setView] = useState<HubView>(progress.placementCompleted ? 'hub' : 'hub');
  const [session, setSession] = useState<SessionConfig | null>(null);
  const [result, setResult] = useState<{ accuracy: number; xpEarned: number; combo: number; mistakes: EducationalQuestion[] } | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const pointer = EnglishLearningEngine.continuePointer(ready);
  const nodes = EnglishLearningEngine.mapNodes(ready);
  const insights = EnglishLearningEngine.insights(ready);
  const vocabStats = EnglishVocabularyEngine.stats(progress.vocabulary);
  const notebook = Object.values(ready.errorNotebook || {}).filter((entry) => entry.subjectId === 'ingles' && entry.status !== 'recovered');
  const todayGoal = Math.min(100, Math.round(((ready.stats.questionsToday || 0) / Math.max(1, ready.settings.dailyGoal || 10)) * 100));

  const setHubView = (next: HubView, immersive = false) => {
    setView(next);
    onImmersiveChange?.(immersive);
  };

  const startSession = (config: SessionConfig) => {
    setSession(config);
    setResult(null);
    setHubView('lesson', true);
  };

  const startLesson = (lessonId?: string) => {
    const id = lessonId || pointer.lesson?.id;
    if (!id) return;
    startSession({
      title: pointer.lesson?.title || 'Continue learning',
      kind: 'lesson',
      questions: EnglishLearningEngine.buildSession('lesson', ready, { lessonId: id }),
      lessonId: id,
    });
  };

  const englishMistakes = useMemo(() => {
    const grouped: Record<string, { topicId: string; count: number; skill?: string }> = {};
    for (const entry of notebook) {
      grouped[entry.topicId] = grouped[entry.topicId] || { topicId: entry.topicId, count: 0, skill: entry.englishSkill };
      grouped[entry.topicId].count += entry.timesWrong;
    }
    return Object.values(grouped).sort((a, b) => b.count - a.count);
  }, [notebook]);

  if (view === 'placement') {
    return (
      <EnglishPlacementTest
        userState={ready}
        onFinish={(state) => {
          onUpdate(state);
          setHubView('hub');
        }}
        onSkip={() => {
          onUpdate(EnglishLearningEngine.startFromBeginning(ready));
          setHubView('hub');
        }}
      />
    );
  }

  if (view === 'lesson' && session) {
    return (
      <EnglishLessonScreen
        title={session.title}
        questions={session.questions}
        userState={ready}
        lives={session.lives}
        onUpdate={onUpdate}
        onExit={() => {
          setSession(null);
          setHubView('hub');
        }}
        onComplete={(payload) => {
          let next = payload.state;
          if (session.lessonId) next = EnglishLearningEngine.completeLesson(payload.state, session.lessonId, payload.accuracy, payload.xpEarned);
          onUpdate(next);
          setResult(payload);
          setHubView('result', true);
        }}
      />
    );
  }

  if (view === 'result' && result) {
    return (
      <EnglishLessonResult
        xpEarned={result.xpEarned}
        accuracy={result.accuracy}
        combo={result.combo}
        wordsLearned={vocabStats.mastered}
        mistakes={result.mistakes}
        skillNote={insights[0]}
        onContinue={() => {
          setSession(null);
          setResult(null);
          setHubView('hub');
        }}
        onReviewMistakes={() => {
          setSession(null);
          setResult(null);
          onOpenNotebook();
        }}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-3 sm:p-5">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="min-h-11 min-w-11 rounded-2xl border border-neutral-800" aria-label="Voltar ao hub">
          <ArrowLeft className="mx-auto" size={18} />
        </button>
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-300">
            <Languages size={14} /> Língua Inglesa
          </p>
          <h1 className="text-2xl font-black text-white">English Hub</h1>
        </div>
      </div>

      <div className="grid gap-3 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-neutral-950 to-neutral-950 p-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-neutral-500">Estimated CEFR</p>
          <p className="text-4xl font-black text-white">{EnglishCEFRManager.label(progress.estimatedCefr)}</p>
          <p className="text-xs text-neutral-400">{EnglishCEFRManager.estimatedLabel(progress.estimatedCefr)} · não é certificação oficial</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-2">
            <Zap size={14} className="mx-auto text-amber-400" />
            <p className="text-xs text-neutral-500">XP global</p>
            <p className="font-black text-white">{ready.totalXP.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-2">
            <Flame size={14} className="mx-auto text-orange-400" />
            <p className="text-xs text-neutral-500">Streak global</p>
            <p className="font-black text-white">{ready.streak.currentStreak}d</p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-2">
            <Trophy size={14} className="mx-auto text-amber-300" />
            <p className="text-xs text-neutral-500">Rank global</p>
            <div className="mt-1 flex justify-center"><RankBadge rank={ready.rank} size="sm" /></div>
          </div>
        </div>
      </div>

      {!progress.placementCompleted && (
        <div className="flex flex-col gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 sm:flex-row">
          <button type="button" onClick={() => setHubView('placement', true)} className="min-h-12 flex-1 rounded-2xl bg-blue-600 font-black text-white">
            Faça um teste de nível
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdate(EnglishLearningEngine.startFromBeginning(ready));
            }}
            className="min-h-12 flex-1 rounded-2xl border border-neutral-700 font-bold text-white"
          >
            Começar do início
          </button>
        </div>
      )}

      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
        <p className="text-xs font-black uppercase tracking-wider text-blue-300">Continue Learning</p>
        <p className="mt-1 text-lg font-black text-white">
          {pointer.cefr.toUpperCase()} · {pointer.unit?.title || 'Foundation'}
        </p>
        <p className="text-sm text-neutral-400">
          {pointer.lesson?.title} · Lesson {(pointer.unit?.lessons.findIndex((item) => item.id === pointer.lesson?.id) || 0) + 1}/{pointer.unit?.lessons.length || 1} · ~{pointer.lesson?.minutes || 6} min
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-800">
          <div className="h-full bg-blue-500" style={{ width: `${progress.course.completedPercent}%` }} />
        </div>
        <p className="mt-1 text-xs text-neutral-500">Course completion {progress.course.completedPercent}% · diferente do XP</p>
        <button type="button" onClick={() => startLesson()} className="mt-3 min-h-12 w-full rounded-2xl bg-blue-600 font-black text-white">
          CONTINUE
        </button>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-black uppercase tracking-wider text-neutral-400">Today</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <TodayCard title="Continue course" detail={pointer.lesson?.title || 'Foundation'} onClick={() => startLesson()} />
          <TodayCard title={`Review ${vocabStats.due} words`} detail="Spaced repetition" onClick={() => startSession({ title: 'Review Due', kind: 'review', questions: EnglishLearningEngine.buildSession('review', ready) })} />
          <TodayCard title={`${notebook.length} mistakes need review`} detail="Caderno de Erros" onClick={onOpenNotebook} />
          <TodayCard title="Listening practice" detail={insights.find((line) => line.toLowerCase().includes('listening')) || 'Treino auditivo'} onClick={() => startSession({ title: 'Listening', kind: 'skill', questions: EnglishLearningEngine.buildSession('skill', ready, { skill: 'listening' }) })} />
          <TodayCard title="Daily English Quest" detail={`Meta diária global ${todayGoal}%`} onClick={() => startLesson()} />
        </div>
      </section>

      <EnglishSkillsPanel
        progress={progress}
        onPractice={(skill: EnglishSkill) => startSession({ title: EnglishLearningEngine.skillLabel(skill), kind: 'skill', questions: EnglishLearningEngine.buildSession('skill', ready, { skill }) })}
      />

      <div className="flex flex-wrap gap-2">
        <NavChip icon={<Map size={14} />} label="Mapa" onClick={() => setHubView('map')} />
        <NavChip icon={<BookOpen size={14} />} label="My Vocabulary" onClick={() => setHubView('vocab')} />
        <NavChip icon={<Sparkles size={14} />} label="Practice" onClick={() => setHubView('practice')} />
        <NavChip icon={<MessageCircle size={14} />} label="Conversation" onClick={() => setHubView('conversation')} />
        <NavChip icon={<Sparkles size={14} />} label="AI Teacher" onClick={() => setHubView('teacher')} />
        <NavChip icon={<BookOpen size={14} />} label="Erros" onClick={() => setHubView('mistakes')} />
        <NavChip icon={<Trophy size={14} />} label="Vestibular" onClick={onOpenVestibular} />
      </div>

      {view === 'map' && (
        <EnglishCourseMap
          nodes={nodes}
          onOpenUnit={(unitId) => {
            const unit = getUnitById(unitId);
            const node = nodes.find((item) => item.unitId === unitId);
            if (!unit || node?.status === 'locked') return;
            if (unit.isBoss) {
              startSession({ title: `Unit Challenge · ${unit.title}`, kind: 'boss', questions: EnglishLearningEngine.buildSession('boss', ready, { unitId }), lives: undefined });
              return;
            }
            const lesson = unit.lessons.find((item) => !progress.course.lessonProgress[item.id]?.completedAt) || unit.lessons[0];
            startLesson(lesson.id);
          }}
        />
      )}

      {view === 'vocab' && (
        <EnglishVocabularyScreen
          vocabulary={progress.vocabulary}
          selectedWord={word}
          onSelectWord={setWord}
          onReview={() => startSession({ title: 'Vocabulary Review', kind: 'review', questions: EnglishLearningEngine.buildSession('review', ready) })}
        />
      )}

      {view === 'practice' && (
        <EnglishPracticeCenter
          progress={progress}
          insights={insights}
          onStart={(kind, skill) => {
            if (kind === 'vestibular') {
              onOpenVestibular();
              return;
            }
            if (kind === 'survival') {
              startSession({ title: 'English Survival', kind: 'survival', questions: EnglishLearningEngine.buildSession('survival', ready), lives: 3 });
              return;
            }
            if (kind === 'review') {
              startSession({ title: 'Review', kind: 'review', questions: EnglishLearningEngine.buildSession('review', ready) });
              return;
            }
            if (kind === 'skill' || kind === 'weakness') {
              startSession({ title: skill ? EnglishLearningEngine.skillLabel(skill) : 'Practice', kind: 'skill', questions: EnglishLearningEngine.buildSession('skill', ready, { skill }) });
              return;
            }
            startLesson();
          }}
        />
      )}

      {view === 'mistakes' && (
        <div className="space-y-2">
          {englishMistakes.length === 0 && <p className="text-sm text-neutral-400">Nenhum erro de Inglês pendente.</p>}
          {englishMistakes.map((group) => (
            <div key={group.topicId} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <p className="font-black text-white">{group.topicId.replace(/_/g, ' ')}</p>
              <p className="text-xs text-neutral-400">{group.count} repeated mistakes {group.skill ? `· ${group.skill}` : ''}</p>
              <button
                type="button"
                onClick={() => startSession({ title: group.topicId, kind: 'skill', questions: EnglishLearningEngine.buildSession('skill', ready, { skill: (group.skill as EnglishSkill) || 'grammar' }) })}
                className="mt-2 min-h-11 rounded-xl bg-blue-600 px-4 text-xs font-black text-white"
              >
                PRACTICE THIS TOPIC
              </button>
            </div>
          ))}
          <button type="button" onClick={onOpenNotebook} className="text-sm text-blue-300">
            Abrir Caderno de Erros completo
          </button>
        </div>
      )}

      {view === 'conversation' && (
        <Suspense fallback={<p className="text-sm text-neutral-400">Carregando conversas…</p>}>
          <EnglishConversationScreen userState={ready} onUpdate={onUpdate} onBack={() => setHubView('hub')} />
        </Suspense>
      )}

      {view === 'teacher' && (
        <Suspense fallback={<p className="text-sm text-neutral-400">Carregando professora…</p>}>
          <EnglishAITeacherScreen userState={ready} />
        </Suspense>
      )}
    </div>
  );
};

function TodayCard({ title, detail, onClick }: { title: string; detail: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-left">
      <p className="text-sm font-black text-white">{title}</p>
      <p className="text-xs text-neutral-400">{detail}</p>
    </button>
  );
}

function NavChip({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900 px-3 text-xs font-bold text-neutral-200">
      {icon} {label}
    </button>
  );
}
