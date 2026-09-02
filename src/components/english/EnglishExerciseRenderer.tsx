import React, { useMemo, useState } from 'react';
import type {
  EducationalQuestion,
  FillBlankQuestion,
  FlashcardQuestion,
  ListeningQuestion,
  MatchingQuestion,
  MultipleChoiceQuestion,
  OrderingQuestion,
  SpeakingQuestion,
  TranslationQuestion,
  WritingQuestion,
} from '../../types';
import { EnglishAudioService } from '../../services/englishAudio';
import { writingHeuristicScore } from '../../utils/englishAnswers';
import { Volume2, Mic, HelpCircle, Check, RotateCcw } from 'lucide-react';

interface EnglishExerciseRendererProps {
  question: EducationalQuestion;
  disabled?: boolean;
  onSubmit: (answer: unknown) => void;
}

export const EnglishExerciseRenderer: React.FC<EnglishExerciseRendererProps> = ({ question, disabled, onSubmit }) => {
  const [text, setText] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [leftId, setLeftId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  const unusedOrder = question.questionType === 'ordering'
    ? (question as OrderingQuestion).items.filter((item) => !order.includes(item.id))
    : [];

  const rightOptions = useMemo(() => {
    if (question.questionType !== 'matching') return [];
    return shuffle((question as MatchingQuestion).pairs.map((pair) => pair.right));
  }, [question]);

  const submitDisabled = Boolean(disabled);

  const playAudio = (value: string) => {
    if (!EnglishAudioService.canSpeak()) return;
    EnglishAudioService.speak(value);
  };

  const startSpeech = async (acceptedFallback: string[]) => {
    setSttError(null);
    setListening(true);
    try {
      const transcript = await EnglishAudioService.listen();
      setText(transcript);
      onSubmit(transcript || acceptedFallback[0] || '');
    } catch (error) {
      setSttError(
        error instanceof Error && error.message === 'STT_UNAVAILABLE'
          ? 'Reconhecimento de fala não está configurado neste navegador. Você pode digitar a frase.'
          : 'Não foi possível capturar o microfone. Permita o acesso ou digite a frase.'
      );
    } finally {
      setListening(false);
    }
  };

  if (question.questionType === 'multiple_choice' || question.questionType === 'listening') {
    const data = question as MultipleChoiceQuestion | ListeningQuestion;
    const audio = question.questionType === 'listening' ? (question as ListeningQuestion).audioText : question.audioText;
    return (
      <div className="space-y-3">
        {audio && (
          <button
            type="button"
            onClick={() => playAudio(audio)}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-blue-500/40 bg-blue-500/10 px-4 text-sm font-bold text-blue-200"
            aria-label="Reproduzir áudio"
          >
            <Volume2 size={18} /> Ouvir
          </button>
        )}
        <div className="grid gap-2">
          {data.options.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={submitDisabled}
              onClick={() => {
                setSelected(option.id);
                onSubmit(option.id);
              }}
              className={`min-h-12 rounded-2xl border px-4 py-3 text-left text-sm ${
                selected === option.id ? 'border-blue-400 bg-blue-500/20 text-white' : 'border-neutral-800 bg-neutral-950 text-neutral-200'
              }`}
            >
              <span className="mr-2 font-black text-blue-300">{option.id}</span>
              {option.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (question.questionType === 'fill_blank') {
    const data = question as FillBlankQuestion;
    return (
      <div className="space-y-3">
        <p className="text-sm text-neutral-300">{data.template.replace('{blank}', '_____')}</p>
        {data.options?.length ? (
          <div className="flex flex-wrap gap-2">
            {data.options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={submitDisabled}
                onClick={() => onSubmit(option)}
                className="min-h-11 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-sm font-bold text-white"
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit(text);
            }}
            className="space-y-2"
          >
            <label className="sr-only" htmlFor={`blank-${question.id}`}>
              Complete a frase
            </label>
            <input
              id={`blank-${question.id}`}
              value={text}
              onChange={(event) => setText(event.target.value)}
              disabled={submitDisabled}
              className="min-h-12 w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 text-white"
              autoComplete="off"
            />
            <button type="submit" disabled={submitDisabled || !text.trim()} className="min-h-12 w-full rounded-2xl bg-blue-600 font-black text-white">
              Conferir
            </button>
          </form>
        )}
      </div>
    );
  }

  if (question.questionType === 'translation' || question.questionType === 'writing') {
    const writing = question.questionType === 'writing' ? (question as WritingQuestion) : null;
    const translation = question.questionType === 'translation' ? (question as TranslationQuestion) : null;
    const heuristic = writing ? writingHeuristicScore(text, writing.minWords || 8) : null;
    return (
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(text);
        }}
      >
        {translation && <p className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200">{translation.sourceText}</p>}
        <label className="sr-only" htmlFor={`open-${question.id}`}>
          Sua resposta
        </label>
        <textarea
          id={`open-${question.id}`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={submitDisabled}
          rows={writing ? 5 : 3}
          className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 p-3 text-sm text-white"
        />
        {heuristic && <p className="text-xs text-neutral-400">{heuristic.feedback}</p>}
        <button type="submit" disabled={submitDisabled || !text.trim()} className="min-h-12 w-full rounded-2xl bg-blue-600 font-black text-white">
          Enviar
        </button>
      </form>
    );
  }

  if (question.questionType === 'ordering') {
    const data = question as OrderingQuestion;
    const byId = Object.fromEntries(data.items.map((item) => [item.id, item.text]));
    return (
      <div className="space-y-3">
        <p className="text-xs text-neutral-400">Toque nas palavras na ordem. Também funciona arrastando no desktop.</p>
        <div className="flex min-h-16 flex-wrap gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-3">
          {order.map((id, index) => (
            <button
              key={`${id}-${index}`}
              type="button"
              disabled={submitDisabled}
              draggable
              onDragStart={(event) => event.dataTransfer.setData('text/plain', String(index))}
              onDrop={(event) => {
                event.preventDefault();
                const from = Number(event.dataTransfer.getData('text/plain'));
                setOrder((current) => {
                  const next = [...current];
                  const [moved] = next.splice(from, 1);
                  next.splice(index, 0, moved);
                  return next;
                });
              }}
              onDragOver={(event) => event.preventDefault()}
              onClick={() => setOrder((current) => current.filter((itemId) => itemId !== id))}
              className="min-h-11 rounded-xl bg-blue-600 px-3 text-sm font-bold text-white"
            >
              {byId[id]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(unusedOrder.length ? unusedOrder : data.items.filter((item) => !order.includes(item.id))).map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={submitDisabled}
              onClick={() => setOrder((current) => [...current, item.id])}
              className="min-h-11 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-sm font-bold text-white"
            >
              {item.text}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setOrder([])} className="min-h-11 flex-1 rounded-xl border border-neutral-700 text-xs font-bold text-neutral-300">
            <span className="inline-flex items-center gap-1"><RotateCcw size={14} /> Limpar</span>
          </button>
          <button
            type="button"
            disabled={submitDisabled || order.length !== data.items.length}
            onClick={() => onSubmit(order)}
            className="min-h-11 flex-1 rounded-xl bg-blue-600 text-sm font-black text-white"
          >
            Conferir
          </button>
        </div>
      </div>
    );
  }

  if (question.questionType === 'matching') {
    const data = question as MatchingQuestion;
    return (
      <div className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-2">
            {data.pairs.map((pair) => (
              <button
                key={pair.id}
                type="button"
                disabled={submitDisabled}
                onClick={() => setLeftId(pair.id)}
                className={`min-h-11 w-full rounded-xl border px-3 text-left text-sm ${
                  leftId === pair.id ? 'border-blue-400 bg-blue-500/20' : 'border-neutral-800 bg-neutral-950'
                }`}
              >
                {pair.left}
                {matches[pair.id] ? <span className="ml-2 text-xs text-emerald-400">→ {matches[pair.id]}</span> : null}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {rightOptions.map((right) => (
              <button
                key={right}
                type="button"
                disabled={submitDisabled || !leftId}
                onClick={() => {
                  if (!leftId) return;
                  const next = { ...matches, [leftId]: right };
                  setMatches(next);
                  setLeftId(null);
                }}
                className="min-h-11 w-full rounded-xl border border-neutral-800 bg-neutral-900 text-sm text-neutral-200"
              >
                {right}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          disabled={submitDisabled || Object.keys(matches).length < data.pairs.length}
          onClick={() => onSubmit(matches)}
          className="min-h-12 w-full rounded-2xl bg-blue-600 font-black text-white"
        >
          Conferir pares
        </button>
      </div>
    );
  }

  if (question.questionType === 'flashcard') {
    const data = question as FlashcardQuestion;
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setFlipped((value) => !value)}
          className="min-h-28 w-full rounded-3xl border border-blue-500/30 bg-neutral-950 p-5 text-lg font-black text-white"
        >
          {flipped ? data.backResponse : data.frontPrompt}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={submitDisabled} onClick={() => onSubmit(false)} className="min-h-12 rounded-2xl border border-rose-500/40 text-sm font-bold text-rose-300">
            Ainda não
          </button>
          <button type="button" disabled={submitDisabled} onClick={() => onSubmit(true)} className="min-h-12 rounded-2xl bg-emerald-600 text-sm font-black text-white">
            Lembro
          </button>
        </div>
      </div>
    );
  }

  if (question.questionType === 'speaking') {
    const data = question as SpeakingQuestion;
    return (
      <div className="space-y-3">
        <p className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-base font-bold text-white">“{data.promptToSpeak}”</p>
        <button type="button" onClick={() => playAudio(data.promptToSpeak)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-blue-500/40 text-sm font-bold text-blue-200">
          <Volume2 size={16} /> Ouvir modelo
        </button>
        <button
          type="button"
          disabled={submitDisabled || listening}
          onClick={() => startSpeech(data.acceptedAnswers)}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 font-black text-white"
        >
          <Mic size={16} /> {listening ? 'Ouvindo…' : 'Falar'}
        </button>
        {sttError && <p className="text-xs text-amber-300">{sttError}</p>}
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Ou digite o que disse"
          className="min-h-12 w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 text-sm text-white"
        />
        <button type="button" disabled={submitDisabled || !text.trim()} onClick={() => onSubmit(text)} className="min-h-12 w-full rounded-2xl border border-neutral-600 font-bold text-white">
          Enviar texto
        </button>
      </div>
    );
  }

  return (
    <p className="text-sm text-neutral-400">Este tipo de exercício ainda usa o renderer genérico.</p>
  );
};

export function EnglishWhyButton({ explanation, reduceMotion }: { explanation: string; reduceMotion?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-neutral-700 px-3 text-xs font-bold text-neutral-200"
      >
        <HelpCircle size={14} /> WHY?
      </button>
      {open && (
        <p className={`rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-50 ${reduceMotion ? '' : 'animate-in fade-in'}`}>
          {explanation}
        </p>
      )}
    </div>
  );
}

function shuffle<T>(values: T[]): T[] {
  return [...values].sort(() => Math.random() - 0.5);
}

export function EnglishFeedback({ correct, sentence }: { correct: boolean; sentence?: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${correct ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-rose-500/40 bg-rose-500/10'}`}>
      <p className="flex items-center gap-2 text-sm font-black text-white">
        <Check size={16} /> {correct ? 'Correct!' : 'Not quite.'}
      </p>
      {!correct && sentence ? <p className="mt-1 text-sm text-neutral-200">Correct answer: {sentence}</p> : null}
    </div>
  );
}
