import React, { useState, useEffect, useRef } from 'react';
import { Swords, Clock, Check, X, Trophy, ArrowRight, ShieldCheck, Flame, Zap, Award, Share2 } from 'lucide-react';
import { Challenge, ChallengePlayerResult, UserState } from '../types';
import { SocialService } from '../services/socialService';

interface ChallengeArenaProps {
  challenge: Challenge;
  currentUser: UserState;
  onFinish: (updatedChallenge: Challenge) => void;
  onExit: () => void;
}

export const ChallengeArena: React.FC<ChallengeArenaProps> = ({
  challenge,
  currentUser,
  onFinish,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState<ChallengePlayerResult['answers']>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalChallenge, setFinalChallenge] = useState<Challenge>(challenge);
  const [submitting, setSubmitting] = useState(false);

  // Timer ticker
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const questions = challenge.questions || [];
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());

    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (inputRef.current && !isCompleted) {
      inputRef.current.focus();
    }
  }, [currentIndex, isCompleted]);

  const handleAnswerSubmit = async () => {
    if (!inputValue.trim() || !currentQuestion) return;

    const userNum = parseFloat(inputValue.trim().replace(',', '.'));
    const now = Date.now();
    const timeTaken = now - questionStartTime;

    const record = {
      questionId: currentQuestion?.id || `q_${currentIndex}`,
      expressionString: currentQuestion?.expressionString || '',
      userAnswer: userNum,
      timeTakenMs: timeTaken,
    };

    const newAnswers = [...answers, record];
    setAnswers(newAnswers);
    setInputValue('');

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      // Finished all questions!
      if (timerRef.current) clearInterval(timerRef.current);
      const totalTime = Date.now() - startTime;
      const avgTime = Math.round(totalTime / (questions.length || 1));

      const result: ChallengePlayerResult = {
        userId: currentUser?.id || 'user',
        username: currentUser?.username || `@${currentUser?.name || 'user'}`,
        displayName: currentUser?.displayName || currentUser?.name || 'Matemático',
        correctCount: 0,
        totalQuestions: questions.length,
        totalTimeMs: totalTime,
        avgTimeMs: avgTime,
        accuracy: 0,
        answers: newAnswers,
        completedAt: Date.now(),
      };

      setIsCompleted(true);
      setSubmitting(true);

      try {
        const chalId = challenge?.id || 'challenge';
        const uId = currentUser?.id || 'user';
        const sub = await SocialService.submitChallengeAttempt(chalId, uId, result);
        if (sub?.challenge) {
          setFinalChallenge(sub.challenge);
          onFinish(sub.challenge);
        }
      } catch (err) {
        console.error('Error submitting challenge:', err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnswerSubmit();
    }
  };

  // If already finished, display comparison results
  if (isCompleted) {
    const fc = finalChallenge || challenge;
    const isChallenger = fc.challengerId === currentUser.id;
    const myResult = isChallenger ? fc.challengerResult : fc.opponentResult;
    const oppResult = isChallenger ? fc.opponentResult : fc.challengerResult;
    const oppName = isChallenger ? fc.opponentDisplayName : fc.challengerDisplayName;
    const isDuelComplete = !!(fc.challengerResult && fc.opponentResult);

    const amIWinner = fc.winnerId === currentUser.id;
    const isDraw = fc.winnerId === 'draw';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
          {/* Header result */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-950/80 border border-orange-500/40 text-orange-400 mb-3 text-3xl shadow-lg">
              {isDuelComplete ? (
                amIWinner ? <Trophy className="w-8 h-8 text-amber-400 animate-bounce" /> : isDraw ? <Award className="w-8 h-8 text-sky-400" /> : <Swords className="w-8 h-8 text-rose-400" />
              ) : (
                <Clock className="w-8 h-8 text-orange-400 animate-pulse" />
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isDuelComplete
                ? amIWinner
                  ? 'VITÓRIA MATEMÁTICA!'
                  : isDraw
                  ? 'EMPATE TÉCNICO!'
                  : 'DUELO FINALIZADO'
                : 'DESAFIO ENVIADO!'}
            </h2>
            <p className="text-xs sm:text-sm text-[#888] mt-1">
              {isDuelComplete
                ? 'Confronto direto avaliado por acertos, tempo total e velocidade média.'
                : `Você completou suas 20 questões! Aguardando ${oppName} jogar o mesmo conjunto de questões.`}
            </p>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* My performance */}
            <div className={`p-4 rounded-xl border ${amIWinner ? 'bg-orange-950/30 border-orange-500/60' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>{currentUser.avatar || '🦊'}</span>
                  <span>Você ({myResult?.displayName})</span>
                </span>
                {amIWinner && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/40">
                    VENCEDOR
                  </span>
                )}
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#888]">Acertos:</span>
                  <span className="font-bold text-emerald-400">{myResult?.correctCount} / {questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">Tempo Total:</span>
                  <span className="font-bold text-white">{( (myResult?.totalTimeMs || 0) / 1000 ).toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">Tempo Médio:</span>
                  <span className="font-bold text-orange-400">{myResult?.avgTimeMs} ms/q</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">Precisão:</span>
                  <span className="font-bold text-sky-400">{myResult?.accuracy}%</span>
                </div>
              </div>
            </div>

            {/* Opponent's performance */}
            <div className={`p-4 rounded-xl border ${!amIWinner && isDuelComplete && !isDraw ? 'bg-orange-950/30 border-orange-500/60' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>{isChallenger ? finalChallenge.opponentAvatar : finalChallenge.challengerAvatar}</span>
                  <span>{oppName}</span>
                </span>
                {!amIWinner && isDuelComplete && !isDraw && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/40">
                    VENCEDOR
                  </span>
                )}
              </div>
              {oppResult ? (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#888]">Acertos:</span>
                    <span className="font-bold text-emerald-400">{oppResult.correctCount} / {questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Tempo Total:</span>
                    <span className="font-bold text-white">{(oppResult.totalTimeMs / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Tempo Médio:</span>
                    <span className="font-bold text-orange-400">{oppResult.avgTimeMs} ms/q</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888]">Precisão:</span>
                    <span className="font-bold text-sky-400">{oppResult.accuracy}%</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-[#666] flex flex-col items-center justify-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400/70 animate-spin" />
                  <span className="text-xs">Aguardando {oppName} responder...</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onExit}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 px-4 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-950/50 text-sm"
          >
            <span>Voltar ao Hub Social</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Active Duel Arena
  const progressPercent = Math.round((currentIndex / questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-lg animate-fadeIn select-none">
      <div className="bg-[#121212] border border-[#262626] rounded-2xl w-full max-w-xl p-5 sm:p-8 shadow-2xl flex flex-col">
        {/* Top Header Match Info */}
        <div className="flex items-center justify-between border-b border-[#222] pb-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-orange-400">
            <Swords className="w-4 h-4" />
            <span>DESAFIO 1v1</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-sm bg-[#1a1a1a] px-3 py-1 rounded-xl border border-[#333]">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-white font-bold tabular-nums">{(elapsedMs / 1000).toFixed(1)}s</span>
          </div>

          <button
            onClick={onExit}
            className="text-xs text-[#777] hover:text-rose-400 font-mono uppercase tracking-wider transition cursor-pointer"
          >
            Abandonar
          </button>
        </div>

        {/* Question Counter & Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#888]">Questão {currentIndex + 1} de {questions.length}</span>
            <span className="text-orange-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden border border-[#333]/50">
            <div
              className="h-full bg-orange-500 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Center Expression Card */}
        {currentQuestion && (
          <div className="bg-gradient-to-b from-[#1c1c1c] to-[#141414] border-2 border-orange-500/40 rounded-2xl p-8 sm:p-10 text-center shadow-xl mb-6 flex flex-col items-center justify-center">
            <span className="text-3xl sm:text-5xl font-black text-white font-mono tracking-wider">
              {currentQuestion.expressionString} = ?
            </span>
          </div>
        )}

        {/* Input & Keypad */}
        <div className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.replace(/[^0-9.-]/g, ''))}
              onKeyDown={handleKeyDown}
              placeholder="Digite o resultado..."
              className="w-full bg-[#1c1c1c] border-2 border-[#333] focus:border-orange-500 rounded-xl py-3 px-4 text-xl sm:text-2xl font-mono text-center text-white focus:outline-none transition shadow-inner"
              autoFocus
            />
          </div>

          <button
            onClick={handleAnswerSubmit}
            disabled={!inputValue.trim()}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition cursor-pointer text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-950/50"
          >
            <span>Responder (Enter)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
