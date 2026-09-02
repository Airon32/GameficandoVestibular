import React, { useMemo, useState } from 'react';
import type { VocabularyEntry } from '../../types';
import { EnglishVocabularyEngine } from '../../engines/EnglishVocabularyEngine';
import { EnglishCEFRManager } from '../../engines/EnglishCEFRManager';
import { ArrowLeft, Search } from 'lucide-react';

type VocabFilter = 'all' | 'new' | 'learning' | 'weak' | 'strong' | 'mastered';

export const EnglishVocabularyScreen: React.FC<{
  vocabulary: Record<string, VocabularyEntry>;
  selectedWord?: string | null;
  onSelectWord: (word: string | null) => void;
  onReview: () => void;
}> = ({ vocabulary, selectedWord, onSelectWord, onReview }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<VocabFilter>('all');
  const stats = EnglishVocabularyEngine.stats(vocabulary);
  const entries = useMemo(() => {
    return (Object.values(vocabulary) as VocabularyEntry[])
      .filter((entry) => {
        if (query && !`${entry.word} ${entry.translation}`.toLowerCase().includes(query.toLowerCase())) return false;
        if (filter === 'new') return entry.timesSeen === 0;
        if (filter === 'learning') return entry.timesSeen > 0 && entry.mastery < 50;
        if (filter === 'weak') return entry.mastery > 0 && entry.mastery < 40;
        if (filter === 'strong') return entry.mastery >= 50 && entry.mastery < 85;
        if (filter === 'mastered') return entry.mastery >= 85;
        return true;
      })
      .sort((a, b) => a.word.localeCompare(b.word));
  }, [vocabulary, query, filter]);

  const selected = selectedWord ? vocabulary[selectedWord] : null;
  if (selected) {
    return <EnglishVocabularyDetails entry={selected} onBack={() => onSelectWord(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <Mini label="Total" value={stats.total} />
        <Mini label="New" value={stats.new} />
        <Mini label="Learning" value={stats.learning} />
        <Mini label="Strong" value={stats.strong} />
        <Mini label="Mastered" value={stats.mastered} />
        <Mini label="Due" value={stats.due} />
      </div>
      <button type="button" onClick={onReview} className="min-h-12 w-full rounded-2xl bg-blue-600 font-black text-white">
        START REVIEW · {stats.due} due
      </button>
      <label className="flex min-h-12 items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-950 px-3">
        <Search size={16} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm text-white outline-none" placeholder="Buscar palavra" />
      </label>
      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'learning', 'weak', 'strong', 'mastered'] as VocabFilter[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${filter === item ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-neutral-400'}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {entries.map((entry) => (
          <button
            key={entry.word}
            type="button"
            onClick={() => onSelectWord(entry.word)}
            className="flex min-h-16 w-full items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900 px-4 text-left"
          >
            <div>
              <p className="font-black text-white">{entry.word}</p>
              <p className="text-xs text-neutral-400">{entry.translation}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-blue-300">{EnglishCEFRManager.label(entry.cefr)}</p>
              <p className="text-xs text-neutral-500">Strength {entry.mastery}%</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export const EnglishVocabularyDetails: React.FC<{ entry: VocabularyEntry; onBack: () => void }> = ({ entry, onBack }) => {
  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 text-sm text-neutral-300">
        <ArrowLeft size={16} /> Voltar
      </button>
      <div className="rounded-3xl border border-blue-500/30 bg-neutral-900 p-5">
        <p className="text-3xl font-black text-white">{entry.word}</p>
        <p className="text-lg text-blue-200">{entry.translation}</p>
        <p className="mt-2 text-sm text-neutral-300">{entry.definition}</p>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <Row label="CEFR" value={entry.cefr.toUpperCase()} />
        <Row label="Classe" value={entry.partOfSpeech} />
        <Row label="Mastery" value={`${entry.mastery}%`} />
        <Row label="Visto" value={String(entry.timesSeen)} />
        <Row label="Acertos" value={String(entry.timesCorrect)} />
        <Row label="Erros" value={String(entry.timesWrong)} />
        <Row label="Última revisão" value={entry.lastReviewedAt ? new Date(entry.lastReviewedAt).toLocaleDateString() : '—'} />
        <Row label="Próxima" value={entry.nextReviewAt ? new Date(entry.nextReviewAt).toLocaleDateString() : '—'} />
      </dl>
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-neutral-500">Examples</p>
        {entry.exampleSentences.map((sentence) => (
          <p key={sentence} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200">
            {sentence}
          </p>
        ))}
      </div>
    </div>
  );
};

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-2 text-center">
      <p className="text-[10px] uppercase text-neutral-500">{label}</p>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
      <dt className="text-[10px] uppercase text-neutral-500">{label}</dt>
      <dd className="font-bold text-white">{value}</dd>
    </div>
  );
}
