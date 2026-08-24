import React, { useState } from 'react';
import {
  X,
  Trophy,
  Flame,
  Swords,
  UserPlus,
  UserX,
  Ban,
  Edit3,
  LogOut,
  Trash2,
  Target,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { UserState, FriendProfileSummary, ProfilePrivacy } from '../types';
import { SocialService } from '../services/socialService';
import { RankBadge } from './RankBadge';
import { RankFrame } from './RankFrame';
import { RankProfileTheme } from './RankProfileTheme';
import { RankJourneyModal } from './RankJourneyModal';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserState;
  viewingProfile?: FriendProfileSummary | UserState | null;
  isSelf: boolean;
  isFriend?: boolean;
  onStartChallenge?: (profile: FriendProfileSummary) => void;
  onUpdateCurrentUser?: (updated: UserState) => void;
  onLogout?: () => void;
  onDeleteAccount?: () => Promise<void>;
  onRefreshSocial?: () => void;
  onOpenRecovery?: () => void;
}

const AVATAR_OPTIONS = ['🦊', '🦁', '🦉', '🐺', '🐉', '🤖', '🧙', '👨‍🚀', '🥷', '⚡', '👑', '🧠', '🐯', '🦄', '🎯', '🪐'];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  viewingProfile,
  isSelf,
  isFriend = false,
  onStartChallenge,
  onUpdateCurrentUser,
  onLogout,
  onDeleteAccount,
  onRefreshSocial,
  onOpenRecovery,
}) => {
  const profile = (isSelf ? currentUser : viewingProfile) as any;

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(profile?.displayName || profile?.name || '');
  const [editAvatar, setEditAvatar] = useState(profile?.avatar || '🦊');
  const [editBio, setEditBio] = useState(profile?.bio || '');
  const [editTitle, setEditTitle] = useState(profile?.selectedTitle || 'Aprendiz Matemático');
  const [editPrivacy, setEditPrivacy] = useState<ProfilePrivacy>(profile?.privacy || 'public');
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);

  if (!isOpen || !profile) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateCurrentUser) return;
    setSaving(true);

    try {
      const updated: UserState = {
        ...currentUser,
        displayName: editDisplayName.trim() || 'Matemático',
        name: editDisplayName.trim() || 'Matemático',
        avatar: editAvatar,
        bio: editBio.trim(),
        selectedTitle: editTitle,
        privacy: editPrivacy,
        updatedAt: Date.now(),
      };

      onUpdateCurrentUser(updated);
      setIsEditing(false);
    } catch {
      // Ignore
    } finally {
      setSaving(false);
    }
  };

  const handleSendFriendRequest = async () => {
    const targetUid = profile?.userId || profile?.id;
    if (!targetUid) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await SocialService.sendFriendRequest(
        currentUser,
        targetUid,
        profile?.username || `@${profile?.displayName || profile?.name || 'user'}`
      );
      setActionMessage(res.message);
      if (onRefreshSocial) onRefreshSocial();
    } catch {
      setActionMessage('Erro ao enviar solicitação.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    const targetUid = profile?.userId || profile?.id;
    const currentUid = currentUser?.id;
    if (!targetUid || !currentUid) return;
    if (!confirm(`Deseja remover ${profile?.displayName || profile?.name || 'amigo'} dos seus amigos?`)) return;
    setActionLoading(true);
    try {
      await SocialService.removeFriend(currentUid, targetUid);
      if (onRefreshSocial) onRefreshSocial();
      onClose();
    } catch {
      // Ignore
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockUser = async () => {
    const targetUid = profile?.userId || profile?.id;
    const currentUid = currentUser?.id;
    if (!targetUid || !currentUid) return;
    if (!confirm(`Deseja bloquear ${profile?.displayName || profile?.name || 'usuário'}? Vocês não poderão mais se encontrar ou interagir.`)) return;
    setActionLoading(true);
    try {
      await SocialService.blockUser(currentUid, targetUid);
      if (onRefreshSocial) onRefreshSocial();
      onClose();
    } catch {
      // Ignore
    } finally {
      setActionLoading(false);
    }
  };

  const accuracy = profile.stats?.accuracy !== undefined ? profile.stats.accuracy : profile.accuracy || 0;
  const totalQuestions = profile.stats?.totalQuestions !== undefined ? profile.stats.totalQuestions : profile.totalQuestions || 0;
  const maxStreak = profile.streak?.maxStreak !== undefined ? profile.streak.maxStreak : profile.maxStreak || 0;
  const currentStreak = profile.streak?.currentStreak !== undefined ? profile.streak.currentStreak : profile.currentStreak || 0;
  const rankInfo = profile.rank || currentUser.rank;
  const rankName = profile.rank?.fullName || profile.rankFullName || 'Madeira I';
  const unlockedTitles = currentUser.unlockedTitles || ['Aprendiz Matemático', 'Iniciante dos Números'];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
          {/* Top Header Card Themed by Rank */}
          <RankProfileTheme
            rank={rankInfo}
            className="p-6 border-b border-white/10 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 transition cursor-pointer z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              {/* Avatar with Rank Frame */}
              <RankFrame rank={rankInfo} size="lg" className="shrink-0">
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
                  {profile.avatar || '🦊'}
                </div>
              </RankFrame>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                    {profile.displayName || profile.name || 'Matemático'}
                  </h3>
                  {isSelf && (
                    <span className="text-[10px] font-mono bg-black/50 border border-white/20 text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase">
                      Você
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-amber-300/90 font-mono">
                  <span>{profile.username || `@${profile.name?.toLowerCase().replace(/\s+/g, '')}`}</span>
                  <span>•</span>
                  <span className="text-slate-300 font-sans">{profile.selectedTitle || 'Aprendiz Matemático'}</span>
                </div>

                {profile.bio && (
                  <p className="text-xs text-slate-300 mt-2 italic line-clamp-2 leading-relaxed">
                    "{profile.bio}"
                  </p>
                )}
              </div>
            </div>
          </RankProfileTheme>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {actionMessage && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-300 text-xs text-center font-medium">
                {actionMessage}
              </div>
            )}

            {/* Prominent Rank Card */}
            <div className="bg-[#181a20] rounded-2xl p-4 border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <RankBadge rank={rankInfo} division={rankInfo.division} size="md" showGlow={true} />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Escalão Atual
                  </div>
                  <div className="text-base font-black text-white">{rankName}</div>
                  <div className="text-[11px] text-amber-400/90 font-mono">
                    Nível {profile.level || 1} • {((profile.totalXP || 0)).toLocaleString()} XP
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsJourneyOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <span>Jornada</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>

            {isEditing ? (
              /* Edit Profile Form */
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1.5">
                    Avatar
                  </label>
                  <div className="grid grid-cols-8 gap-2 bg-[#1a1a1a] p-2.5 rounded-xl border border-[#262626]">
                    {AVATAR_OPTIONS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setEditAvatar(item)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition cursor-pointer ${
                          editAvatar === item ? 'bg-orange-600 scale-110' : 'bg-[#222] hover:bg-[#333]'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1.5">
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    maxLength={30}
                    className="w-full bg-[#1c1c1c] border border-[#333] rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1.5">
                    Título Selecionado
                  </label>
                  <select
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#333] rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    {unlockedTitles.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1.5">
                    Bio
                  </label>
                  <input
                    type="text"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    maxLength={100}
                    placeholder="Sua bio matemática..."
                    className="w-full bg-[#1c1c1c] border border-[#333] rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1.5">
                    Privacidade
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['public', 'friends_only', 'private'] as ProfilePrivacy[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEditPrivacy(p)}
                        className={`py-2 px-2 rounded-xl border text-xs font-bold transition cursor-pointer capitalize ${
                          editPrivacy === p
                            ? 'bg-orange-950/50 border-orange-500 text-orange-300'
                            : 'bg-[#1a1a1a] border-[#2a2a2a] text-[#888]'
                        }`}
                      >
                        {p === 'public' ? 'Público' : p === 'friends_only' ? 'Amigos' : 'Privado'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-[#222] hover:bg-[#333] text-[#aaa] font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-md shadow-orange-950/40"
                  >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            ) : (
              /* Stats Grid */
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#262626] flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider">Streak Diária</span>
                    <div className="flex items-center gap-1 mt-1 text-white font-mono font-bold text-sm">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span>{currentStreak}d (Max {maxStreak}d)</span>
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#262626] flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider">Precisão Global</span>
                    <div className="flex items-center gap-1 mt-1 text-emerald-400 font-mono font-bold text-sm">
                      <Target className="w-3.5 h-3.5" />
                      <span>{accuracy}%</span>
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#262626] flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider">Resolvidas</span>
                    <span className="text-sm font-mono font-bold text-white mt-1">
                      {totalQuestions.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#262626] flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider">Conquistas</span>
                    <div className="flex items-center gap-1 mt-1 text-purple-400 font-mono font-bold text-sm">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{profile.achievementsCount || Object.keys(profile.achievements || {}).length}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Head to Head Duel History (if viewing a friend) */}
            {!isSelf && (
              <div className="bg-[#1c1c1c] p-4 rounded-xl border border-[#2a2a2a]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#888] flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-orange-400" />
                    Histórico de Confrontos 1v1
                  </span>
                  <span className="text-[10px] font-mono text-[#666]">Duelos Diretos</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono py-2 bg-[#141414] rounded-lg border border-[#222]">
                  <div>
                    <span className="text-[10px] text-[#666] block">Vitórias</span>
                    <span className="font-bold text-emerald-400">{profile.headToHead?.wins || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666] block">Empates</span>
                    <span className="font-bold text-[#888]">{profile.headToHead?.draws || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666] block">Derrotas</span>
                    <span className="font-bold text-rose-400">{profile.headToHead?.losses || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 border-t border-[#262626] flex flex-col gap-2">
              {isSelf && !isEditing && (
                <>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-[#1e1e1e] hover:bg-[#282828] border border-[#333] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar Perfil
                    </button>
                    {onLogout && (
                      <button
                        onClick={onLogout}
                        className="px-4 bg-red-950/30 hover:bg-red-900/40 border border-red-900/50 text-red-400 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sair
                      </button>
                    )}
                  </div>

                  {onDeleteAccount && (
                    <button
                      onClick={async () => {
                        const confirmed = confirm(
                          'Excluir permanentemente a conta e todos os dados? Esta ação não pode ser desfeita.'
                        );
                        if (!confirmed) return;
                        setActionLoading(true);
                        setActionMessage(null);
                        try {
                          await onDeleteAccount();
                        } catch (error) {
                          setActionMessage(error instanceof Error ? error.message : 'Não foi possível excluir a conta.');
                          setActionLoading(false);
                        }
                      }}
                      disabled={actionLoading}
                      className="w-full bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir conta e todos os dados
                    </button>
                  )}

                  {onOpenRecovery && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenRecovery();
                      }}
                      className="w-full bg-orange-950/40 hover:bg-orange-900/50 border border-orange-500/50 text-orange-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                      Recuperar / Vincular Perfil Anterior (Airon / Nv. 8)
                    </button>
                  )}
                </>
              )}

              {!isSelf && (
                <div className="space-y-2">
                  {onStartChallenge && (
                    <button
                      onClick={() => {
                        onClose();
                        onStartChallenge(profile);
                      }}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 cursor-pointer"
                    >
                      <Swords className="w-4 h-4" />
                      Desafiar em Duelo
                    </button>
                  )}

                  <div className="flex gap-2">
                    {isFriend ? (
                      <button
                        onClick={handleRemoveFriend}
                        disabled={actionLoading}
                        className="flex-1 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Remover Amigo
                      </button>
                    ) : (
                      <button
                        onClick={handleSendFriendRequest}
                        disabled={actionLoading}
                        className="flex-1 bg-[#222] hover:bg-[#333] border border-[#333] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-orange-400" />
                        Adicionar Amigo
                      </button>
                    )}

                    <button
                      onClick={handleBlockUser}
                      disabled={actionLoading}
                      className="px-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-[#888] hover:text-red-400 py-2 rounded-xl text-xs font-bold flex items-center justify-center transition cursor-pointer"
                      title="Bloquear usuário"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rank Journey Inspection Modal */}
      {isJourneyOpen && (
        <RankJourneyModal
          isOpen={isJourneyOpen}
          onClose={() => setIsJourneyOpen(false)}
          userState={currentUser}
        />
      )}
    </>
  );
};
