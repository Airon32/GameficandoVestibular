import React, { useState } from 'react';
import { Check, ChevronRight, Compass, Sparkles } from 'lucide-react';
import { UserState } from '../types';
import { RankBadge } from './RankBadge';
import { RankProfileTheme } from './RankProfileTheme';

interface OnboardingModalProps {
  isOpen: boolean;
  userId: string;
  initialEmail?: string;
  existingState: UserState;
  onComplete: (updatedState: UserState) => void;
}

const AVATAR_OPTIONS = ['🦊', '🦁', '🦉', '🐺', '🐉', '🤖', '🧙', '👨‍🚀', '🥷', '⚡', '👑', '🧠', '🐯', '🦄', '🎯', '🪐'];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  userId,
  initialEmail,
  existingState,
  onComplete,
}) => {
  const [displayName, setDisplayName] = useState(existingState.displayName || existingState.name || '');
  const [codename, setCodename] = useState(existingState.username ? existingState.username.replace('@', '') : '');
  const [avatar, setAvatar] = useState(existingState.avatar || '🦊');
  const [bio, setBio] = useState(existingState.bio || '');

  if (!isOpen) return null;

  const cleanCodename = codename.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20);
  const canSubmit = displayName.trim().length >= 2 && cleanCodename.length >= 3;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onComplete({
      ...existingState,
      id: userId,
      username: `@${cleanCodename}`,
      displayName: displayName.trim(),
      name: displayName.trim(),
      email: initialEmail || existingState.email || '',
      avatar,
      bio: bio.trim(),
      updatedAt: Date.now(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 backdrop-blur-xl">
      <RankProfileTheme rank={existingState.rank} className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border shadow-2xl">
        <form onSubmit={handleSubmit} className="p-5 sm:p-8">
          <div className="grid gap-7 md:grid-cols-[0.8fr_1.2fr] md:items-start">
            <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-black/30 p-5 text-center">
              <span className="mb-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Jornada pessoal</span>
              <div className="relative mb-4">
                <div className="absolute inset-0 scale-150 rounded-full bg-orange-400/20 blur-3xl" />
                <RankBadge rank={existingState.rank} size="hero" showDivision />
                <div className="absolute inset-0 flex items-center justify-center text-4xl">{avatar}</div>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Seu herói, sua história</h2>
              <p className="mt-2 text-xs leading-relaxed text-white/60">Este perfil representa apenas a sua evolução. Sem ligas, comparações ou disputas com outras pessoas.</p>
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[11px] font-bold text-emerald-200"><Check size={14} /> Progresso individual e privado</div>
            </div>

            <div>
              <div className="mb-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-orange-300"><Compass size={15} /> Preparar identidade</div>
                <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">Como quer ser lembrado?</h1>
                <p className="mt-1 text-xs text-white/55">Você poderá alterar tudo depois no seu perfil.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-white/55">Escolha seu avatar</label>
                  <div className="grid grid-cols-8 gap-1.5 rounded-2xl border border-white/10 bg-black/25 p-2.5">
                    {AVATAR_OPTIONS.map((item) => (
                      <button key={item} type="button" aria-label={`Usar avatar ${item}`} aria-pressed={avatar === item} onClick={() => setAvatar(item)} className={`aspect-square rounded-xl text-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 ${avatar === item ? 'scale-110 bg-orange-500 shadow-lg shadow-orange-950/50' : 'bg-white/5 hover:bg-white/10'}`}>{item}</button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-white/55">Nome</span>
                  <input value={displayName} onChange={(event) => setDisplayName(event.target.value.slice(0, 30))} placeholder="Como prefere ser chamado?" className="w-full rounded-xl border border-white/10 bg-black/35 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-orange-400" />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-white/55">Codinome da jornada</span>
                  <div className="flex rounded-xl border border-white/10 bg-black/35 focus-within:border-orange-400">
                    <span className="py-3 pl-3.5 text-sm font-bold text-white/35">@</span>
                    <input value={cleanCodename} onChange={(event) => setCodename(event.target.value)} placeholder="futuro_aprovado" className="min-w-0 flex-1 bg-transparent px-1 py-3 pr-3.5 text-sm text-white outline-none placeholder:text-white/25" />
                  </div>
                  <span className="mt-1 block text-[10px] text-white/35">Identificador pessoal salvo com o seu progresso.</span>
                </label>

                <label className="block">
                  <span className="mb-1.5 flex justify-between text-[10px] font-black uppercase tracking-[0.16em] text-white/55"><span>Manifesto pessoal</span><span>{bio.length}/100</span></span>
                  <input value={bio} onChange={(event) => setBio(event.target.value.slice(0, 100))} placeholder="Ex.: Um exercício por vez até a aprovação." className="w-full rounded-xl border border-white/10 bg-black/35 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-orange-400" />
                </label>
              </div>

              <button type="submit" disabled={!canSubmit} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 px-5 py-4 text-sm font-black text-neutral-950 shadow-xl shadow-orange-950/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"><Sparkles size={17} /> Começar minha jornada <ChevronRight size={17} /></button>
            </div>
          </div>
        </form>
      </RankProfileTheme>
    </div>
  );
};
