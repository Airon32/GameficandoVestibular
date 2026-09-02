import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Trophy,
  Flame,
  Zap,
  Target,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { UserState } from '../types';
import { StorageService } from '../services/storageService';
import { RankManager } from '../engines/RankManager';
import { RankBadge } from './RankBadge';
import { RankFrame } from './RankFrame';

interface AccountRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserState: UserState;
  onProfileRestored: (restoredState: UserState) => void;
}

export const AccountRecoveryModal: React.FC<AccountRecoveryModalProps> = ({
  isOpen,
  onClose,
  currentUserState,
  onProfileRestored,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState<UserState[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoredId, setRestoredId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      scanProfiles();
    }
  }, [isOpen]);

  const scanProfiles = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const currentUid = currentUserState?.id || '';
      const found = await StorageService.scanAllLocalAndCloudProfiles(currentUid);
      setCandidates(found);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleRestore = async (targetProfile: UserState) => {
    if (!targetProfile) return;
    setIsRestoring(true);
    setFeedback(null);
    try {
      const searchKey = targetProfile.id || targetProfile.username || targetProfile.name || '';
      const res = await StorageService.restoreFromCloud(searchKey, currentUserState);
      if (res.success && res.state) {
        setRestoredId(targetProfile.id || '');
        onProfileRestored(res.state);
        setFeedback({ message: res.message, success: true });
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        // Direct merge fallback
        const merged = StorageService.mergeUserStates(currentUserState, targetProfile);
        merged.id = currentUserState?.id || targetProfile.id || 'user_local';
        if (targetProfile.displayName) merged.displayName = targetProfile.displayName;
        if (targetProfile.name) merged.name = targetProfile.name;
        if (targetProfile.username && !targetProfile.username.startsWith('@user_')) {
          merged.username = targetProfile.username;
        }
        if (targetProfile.avatar) merged.avatar = targetProfile.avatar;
        if (targetProfile.selectedTitle) merged.selectedTitle = targetProfile.selectedTitle;

        StorageService.saveState(merged);
        onProfileRestored(merged);
        setRestoredId(targetProfile.id);
        setFeedback({
          message: `Progresso de ${targetProfile.displayName || targetProfile.name} restaurado com sucesso!`,
          success: true,
        });
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch {
      setFeedback({ message: 'Erro ao restaurar perfil. Tente novamente.', success: false });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await StorageService.restoreFromCloud(searchQuery.trim(), currentUserState);
      if (res.success && res.state) {
        onProfileRestored(res.state);
        setFeedback({ message: res.message, success: true });
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setFeedback({
          message: 'Nenhum save encontrado com esse e-mail ou ID da sua conta neste dispositivo.',
          success: false,
        });
      }
    } catch {
      setFeedback({ message: 'Erro ao buscar perfil.', success: false });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter candidates based on search query if typed
  const displayedCandidates = candidates.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.username && c.username.toLowerCase().includes(q)) ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.displayName && c.displayName.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      Boolean(c?.id && c.id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#121212] border border-[#2a2a2a] rounded-3xl w-full max-w-lg p-5 sm:p-7 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#777] hover:text-white p-1.5 rounded-xl hover:bg-[#222] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-orange-950/60 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Recuperar o seu progresso</h3>
            <p className="text-xs text-[#888]">Restaure o save deste dispositivo ou o backup da sua conta. O app continua single-player.</p>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-4 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 shrink-0 ${
              feedback.success
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
            }`}
          >
            {feedback.success ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        {/* Search Bar */}
        <form onSubmit={handleManualSearch} className="mb-4 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-[#666] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por @user_user_1, Airon, e-mail..."
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl py-2.5 pl-10 pr-24 text-sm text-white placeholder-[#555] focus:outline-none focus:border-orange-500 transition font-mono"
            />
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-40"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Scan Status & Header */}
        <div className="flex items-center justify-between mb-2.5 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#777]">
            Perfis salvos neste dispositivo
          </span>
          <button
            onClick={scanProfiles}
            disabled={isLoading}
            className="flex items-center gap-1 text-[11px] font-mono text-orange-400 hover:text-orange-300 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Reescanear
          </button>
        </div>

        {/* Profiles List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
          {isLoading ? (
            <div className="p-8 text-center text-[#777] flex flex-col items-center justify-center gap-2.5">
              <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
              <span className="text-xs font-mono">Buscando perfis salvos na nuvem e no dispositivo...</span>
            </div>
          ) : displayedCandidates.length === 0 ? (
            <div className="p-8 text-center bg-[#181818] border border-[#262626] rounded-2xl">
              <ShieldAlert className="w-8 h-8 text-[#555] mx-auto mb-2" />
              <p className="text-sm font-bold text-white mb-1">Nenhum perfil listado</p>
              <p className="text-xs text-[#777]">
                Digite o e-mail ou o ID da sua conta para localizar o seu próprio save.
              </p>
            </div>
          ) : (
            displayedCandidates.map((profile, idx) => {
              const rank = RankManager.getRankForLevel(profile.level || 1);
              const isRestored = restoredId === profile.id;
              const questions = profile.stats?.totalQuestions || 0;
              const achievementsCount = Object.keys(profile.achievements || {}).length;
              const uniqueKey = profile.id ? `${profile.id}_${idx}` : `profile_${idx}`;

              return (
                <div
                  key={uniqueKey}
                  className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isRestored
                      ? 'bg-emerald-950/40 border-emerald-500/50'
                      : 'bg-[#181818] hover:bg-[#1f1f1f] border-[#2a2a2a]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <RankFrame rank={rank} size="sm">
                        <div className="w-full h-full bg-[#222] flex items-center justify-center text-lg">
                          {profile.avatar || '🦊'}
                        </div>
                      </RankFrame>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white truncate">
                          {profile.displayName || profile.name || 'Matemático'}
                        </span>
                        <RankBadge rank={rank} size="xs" showGlow={false} />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#888] mt-0.5">
                        <span className="text-orange-400 font-bold">Nv. {profile.level}</span>
                        <span>•</span>
                        <span>{(profile.totalXP || 0).toLocaleString()} XP</span>
                        <span>•</span>
                        <span className="truncate">{profile.username || `@${(profile.id || 'user').substring(0, 8)}`}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-[#666] mt-1">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-emerald-400" />
                          {questions} resolvidas
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-400" />
                          {achievementsCount} conquistas
                        </span>
                        {profile.selectedTitle && (
                          <span className="text-[#999] truncate">
                            {profile.selectedTitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestore(profile)}
                    disabled={isRestoring}
                    className="w-full sm:w-auto px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-md shadow-orange-950/40 disabled:opacity-50"
                  >
                    {isRestoring ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Restaurar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-[#222] flex items-center justify-between text-[11px] text-[#666] shrink-0">
          <span>Ao restaurar, seus pontos e conquistas são integrados à sua conta atual.</span>
        </div>
      </div>
    </div>
  );
};
