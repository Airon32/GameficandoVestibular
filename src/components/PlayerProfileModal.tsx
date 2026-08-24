import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Award,
  BookOpenCheck,
  ChevronRight,
  Edit3,
  Flame,
  LogOut,
  Route,
  Save,
  Shield,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import { UserState } from '../types';
import { RANK_VISUAL_CONFIGS } from '../config/rankVisualConfig';
import { RankBadge } from './RankBadge';
import { RankFrame } from './RankFrame';
import { RankJourneyModal } from './RankJourneyModal';
import { RankProfileTheme } from './RankProfileTheme';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userState: UserState;
  onUpdateUser: (updated: UserState) => void;
  onLogout?: () => void;
  onDeleteAccount?: () => Promise<void>;
  onOpenRecovery?: () => void;
}

const AVATARS = ['🦊', '🦁', '🦉', '🐺', '🐉', '🤖', '🧙', '👨‍🚀', '🥷', '⚡', '👑', '🧠', '🐯', '🦄', '🎯', '🪐'];

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  userState,
  onUpdateUser,
  onLogout,
  onDeleteAccount,
  onOpenRecovery,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayName, setDisplayName] = useState(userState.displayName || userState.name || 'Estudante');
  const [bio, setBio] = useState(userState.bio || 'Construindo minha aprovação, uma questão por vez.');
  const [avatar, setAvatar] = useState(userState.avatar || '🦊');
  const [selectedTitle, setSelectedTitle] = useState(userState.selectedTitle || 'Aprendiz Matemático');

  if (!isOpen) return null;

  const rank = userState.rank;
  const tierIndex = Math.min(rank.tierIndex ?? 0, RANK_VISUAL_CONFIGS.length - 1);
  const config = rank.visualConfig || RANK_VISUAL_CONFIGS[tierIndex];
  const nextConfig = RANK_VISUAL_CONFIGS[Math.min(tierIndex + 1, RANK_VISUAL_CONFIGS.length - 1)];
  const tokens = config.rankColorTokens;
  const achievementsCount = Object.keys(userState.achievements || {}).length;
  const accuracy = userState.stats.totalQuestions > 0
    ? Math.round((userState.stats.totalCorrect / userState.stats.totalQuestions) * 100)
    : 0;
  const discoveredRanks = Math.min(30, (userState.highestUnlockedRank ?? tierIndex) + 1);
  const levelProgress = Math.max(0, Math.min(100, userState.levelProgressPercent || 0));

  const saveProfile = () => {
    const safeName = displayName.trim() || 'Estudante';
    onUpdateUser({
      ...userState,
      displayName: safeName,
      name: safeName,
      bio: bio.trim().slice(0, 100),
      avatar,
      selectedTitle,
      updatedAt: Date.now(),
    });
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 backdrop-blur-xl sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#090a0e] shadow-[0_30px_120px_rgba(0,0,0,0.8)]"
        >
          <RankProfileTheme rank={rank} variant="modal" className="min-h-full">
            <div className="relative border-b border-white/10 p-5 sm:p-8">
              <button type="button" onClick={onClose} aria-label="Fechar perfil" className="absolute right-4 top-4 z-30 rounded-full border border-white/10 bg-black/35 p-2.5 text-white/60 transition hover:bg-white/10 hover:text-white"><X size={18} /></button>

              <div className="absolute right-0 top-0 select-none text-[9rem] font-black leading-none text-white/[0.025] sm:text-[13rem]">{String(tierIndex + 1).padStart(2, '0')}</div>
              <div className="relative grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
                <div className="relative mx-auto md:mx-0">
                  <div className="absolute inset-0 scale-150 rounded-full blur-3xl" style={{ backgroundColor: tokens.glow }} />
                  <RankFrame rank={rank} size="xl">
                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-black/45 text-5xl">{avatar}</div>
                  </RankFrame>
                  <div className="absolute -bottom-4 -right-5"><RankBadge rank={rank} size="lg" showDivision /></div>
                </div>

                <div className="min-w-0 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                    <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: tokens.textLight }}>{config.rankRarity} · escalão {tierIndex + 1}</span>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold text-emerald-200">Jornada single-player</span>
                  </div>
                  <h1 className="mt-3 truncate text-3xl font-black tracking-tight text-white sm:text-4xl">{userState.displayName || userState.name}</h1>
                  <p className="mt-1 text-sm font-bold" style={{ color: tokens.textLight }}>{userState.selectedTitle}</p>
                  <p className="mt-3 max-w-xl text-xs leading-relaxed text-white/55">{userState.bio || 'Construindo minha aprovação, uma questão por vez.'}</p>
                </div>

                <div className="mx-auto text-center md:mx-0 md:text-right">
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Rank atual</span>
                  <strong className="mt-1 block text-2xl font-black sm:text-3xl" style={{ color: tokens.textLight }}>{rank.fullName}</strong>
                  <span className="mt-1 block text-xs text-white/45">Nível {userState.level} · {userState.totalXP.toLocaleString()} XP</span>
                </div>
              </div>

              <div className="relative mt-7 rounded-2xl border border-white/10 bg-black/30 p-3.5">
                <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-bold">
                  <span className="text-white/55">Progresso do nível {userState.level}</span>
                  <span style={{ color: tokens.textLight }}>{userState.currentLevelXP.toLocaleString()} / {userState.xpForNextLevel.toLocaleString()} XP</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full border border-white/5 bg-black/50">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(2, levelProgress)}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.accent}, ${tokens.textLight})`, boxShadow: `0 0 18px ${tokens.glow}` }} />
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-8">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: 'Questões resolvidas', value: userState.stats.totalQuestions.toLocaleString(), icon: BookOpenCheck, color: '#60A5FA' },
                  { label: 'Precisão geral', value: `${accuracy}%`, icon: Target, color: '#34D399' },
                  { label: 'Maior ofensiva', value: `${userState.streak.maxStreak} dias`, icon: Flame, color: '#FB923C' },
                  { label: 'Conquistas', value: `${achievementsCount}`, icon: Trophy, color: '#FBBF24' },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <metric.icon size={17} style={{ color: metric.color }} />
                    <strong className="mt-3 block text-xl font-black text-white">{metric.value}</strong>
                    <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-white/35">{metric.label}</span>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <button type="button" onClick={() => setIsJourneyOpen(true)} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-5 text-left transition hover:border-white/20">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-35 transition group-hover:scale-110 group-hover:opacity-60"><RankBadge rank={nextConfig.tierIndex} size="preview" isLocked={tierIndex < nextConfig.tierIndex} /></div>
                  <div className="relative max-w-[65%]">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-purple-300"><Route size={15} /> Jornada de prestígio</div>
                    <h2 className="mt-2 text-xl font-black text-white">{discoveredRanks} de 30 ranks descobertos</h2>
                    <p className="mt-1 text-xs leading-relaxed text-white/45">Conheça cada emblema, divisão, moldura e história que ainda espera por você.</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-white">Explorar coleção <ChevronRight size={14} /></span>
                  </div>
                </button>

                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300"><Award size={15} /> Relíquia do rank</div>
                  <h2 className="mt-3 text-base font-black text-white">{config.rankUnlockedPreview.unlockedFrameTitle}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-white/45">{config.rankDescription}</p>
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold" style={{ color: tokens.textLight }}><Shield size={13} className="mr-1.5 inline" />{config.rankSymbol}</div>
                </div>
              </div>

              {isEditing ? (
                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-white/40">Nome</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value.slice(0, 30))} className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-400" /></label>
                    <label className="block"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-white/40">Título equipado</span><select value={selectedTitle} onChange={(event) => setSelectedTitle(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#111319] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-400">{(userState.unlockedTitles || ['Aprendiz Matemático']).map((title) => <option key={title}>{title}</option>)}</select></label>
                  </div>
                  <label className="mt-4 block"><span className="mb-1.5 flex justify-between text-[10px] font-black uppercase tracking-wider text-white/40"><span>Manifesto pessoal</span><span>{bio.length}/100</span></span><input value={bio} onChange={(event) => setBio(event.target.value.slice(0, 100))} className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-400" /></label>
                  <div className="mt-4 grid grid-cols-8 gap-2">{AVATARS.map((item) => <button key={item} type="button" aria-label={`Usar avatar ${item}`} aria-pressed={avatar === item} onClick={() => setAvatar(item)} className={`aspect-square rounded-xl text-lg ${avatar === item ? 'bg-orange-500 ring-2 ring-orange-200' : 'bg-white/5 hover:bg-white/10'}`}>{item}</button>)}</div>
                  <div className="mt-5 flex gap-2"><button type="button" onClick={() => setIsEditing(false)} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white/60">Cancelar</button><button type="button" onClick={saveProfile} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-xs font-black text-black"><Save size={15} /> Salvar perfil</button></div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 border-t border-white/10 pt-5 sm:flex-row">
                  <button type="button" onClick={() => setIsEditing(true)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-black text-white transition hover:bg-white/10"><Edit3 size={15} /> Personalizar perfil</button>
                  {onOpenRecovery ? <button type="button" onClick={() => { onClose(); onOpenRecovery(); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-orange-400/20 bg-orange-400/10 py-3 text-xs font-black text-orange-200"><Sparkles size={15} /> Recuperar progresso</button> : null}
                  {onLogout ? <button type="button" onClick={onLogout} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold text-white/55"><LogOut size={15} /> Sair</button> : null}
                </div>
              )}

              {onDeleteAccount ? <button type="button" disabled={isDeleting} onClick={async () => { if (!confirm('Excluir permanentemente a conta e todo o progresso?')) return; setIsDeleting(true); try { await onDeleteAccount(); } finally { setIsDeleting(false); } }} className="mx-auto flex items-center gap-1.5 text-[10px] font-bold text-red-400/55 transition hover:text-red-300 disabled:opacity-30"><Trash2 size={12} />{isDeleting ? 'Excluindo...' : 'Excluir conta e progresso'}</button> : null}
            </div>
          </RankProfileTheme>
        </motion.div>

        {isJourneyOpen ? <RankJourneyModal isOpen userState={userState} onClose={() => setIsJourneyOpen(false)} /> : null}
      </div>
    </AnimatePresence>
  );
};
