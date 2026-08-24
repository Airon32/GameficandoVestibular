import React, { useState, useEffect } from 'react';
import { Sparkles, Check, AlertCircle, Loader2, Shield, Eye, Users, Lock, ChevronRight } from 'lucide-react';
import { UserState, ProfilePrivacy } from '../types';
import { SocialService } from '../services/socialService';

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
  const [username, setUsername] = useState(
    existingState.username ? existingState.username.replace('@', '') : ''
  );
  const [avatar, setAvatar] = useState(existingState.avatar || '🦊');
  const [bio, setBio] = useState(existingState.bio || '');
  const [privacy, setPrivacy] = useState<ProfilePrivacy>(existingState.privacy || 'public');

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    valid: boolean;
    available?: boolean;
    message?: string;
  }>({ valid: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced check for username validation & Firestore availability
  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus({ valid: false, message: 'Digite um username.' });
      return;
    }

    const clean = SocialService.cleanUsername(username);
    const validation = SocialService.isValidUsername(clean);
    if (!validation.valid) {
      setUsernameStatus({ valid: false, message: validation.error });
      return;
    }

    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const isAvail = await SocialService.isUsernameAvailable(clean, userId);
        if (isAvail) {
          setUsernameStatus({ valid: true, available: true, message: `${clean} está disponível!` });
        } else {
          setUsernameStatus({ valid: false, available: false, message: `${clean} já está em uso por outro jogador.` });
        }
      } catch {
        setUsernameStatus({ valid: true, available: true, message: `${clean} válido.` });
      } finally {
        setCheckingUsername(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [username, userId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameStatus.valid || usernameStatus.available === false) return;

    setIsSubmitting(true);
    const cleanUser = SocialService.cleanUsername(username);

    try {
      // 1. Reserve username
      const reserved = await SocialService.reserveUsername(cleanUser, userId);
      if (!reserved) {
        setUsernameStatus({
          valid: false,
          available: false,
          message: `${cleanUser} acabou de ser reservado por outra pessoa. Escolha outro username.`,
        });
        return;
      }

      // 2. Assemble new user state
      const updated: UserState = {
        ...existingState,
        id: userId,
        username: cleanUser,
        displayName: displayName.trim() || 'Matemático',
        name: displayName.trim() || 'Matemático',
        email: initialEmail || existingState.email || '',
        avatar,
        bio: bio.trim(),
        privacy,
        updatedAt: Date.now(),
      };

      onComplete(updated);
    } catch (err) {
      console.error('Error saving profile onboarding:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-950/80 border border-orange-500/40 text-orange-400 mb-3 text-3xl shadow-lg shadow-orange-950/50">
            <Sparkles className="w-7 h-7 text-orange-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Configure seu Perfil de Jogador
          </h2>
          <p className="text-xs sm:text-sm text-[#999] mt-1.5">
            Crie sua identidade única para competir nas ligas, rankings globais e desafios 1v1.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-2">
              Escolha seu Avatar
            </label>
            <div className="grid grid-cols-8 gap-2 bg-[#1a1a1a] p-3 rounded-xl border border-[#262626]">
              {AVATAR_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAvatar(item)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl transition cursor-pointer ${
                    avatar === item
                      ? 'bg-orange-600 scale-110 shadow-md shadow-orange-900/50'
                      : 'bg-[#222] hover:bg-[#333]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Username (@handle) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888]">
                Username Único (@)
              </label>
              {checkingUsername ? (
                <span className="text-[10px] text-orange-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Verificando...
                </span>
              ) : usernameStatus.message ? (
                <span
                  className={`text-[10px] font-medium flex items-center gap-1 ${
                    usernameStatus.valid && usernameStatus.available !== false
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {usernameStatus.valid && usernameStatus.available !== false ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {usernameStatus.message}
                </span>
              ) : null}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-[#777] font-bold text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                placeholder="seu_usuario"
                maxLength={20}
                required
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-xl py-2.5 pl-8 pr-3 text-sm text-white font-mono placeholder-[#555] focus:outline-none focus:border-orange-500 transition"
              />
            </div>
            <p className="text-[10px] text-[#666] mt-1">
              3 a 20 caracteres. Apenas letras, números, underline (_) e ponto (.).
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1.5">
              Nome de Exibição
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ex: Pedro Santos"
              maxLength={30}
              required
              className="w-full bg-[#1c1c1c] border border-[#333] rounded-xl py-2.5 px-3 text-sm text-white placeholder-[#555] focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888]">
                Bio / Frase de Impacto
              </label>
              <span className="text-[10px] text-[#666] font-mono">{bio.length}/100</span>
            </div>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ex: Focado em velocidade e precisão mental."
              maxLength={100}
              className="w-full bg-[#1c1c1c] border border-[#333] rounded-xl py-2.5 px-3 text-sm text-white placeholder-[#555] focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Privacy Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-2">
              Privacidade do Perfil
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPrivacy('public')}
                className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                  privacy === 'public'
                    ? 'bg-orange-950/40 border-orange-500/60 text-orange-300'
                    : 'bg-[#181818] border-[#2a2a2a] text-[#888] hover:border-[#3a3a3a]'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span className="text-xs font-bold">Público</span>
                <span className="text-[9px] text-[#666] text-center">Aparece em Ligas & Rankings</span>
              </button>

              <button
                type="button"
                onClick={() => setPrivacy('friends_only')}
                className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                  privacy === 'friends_only'
                    ? 'bg-orange-950/40 border-orange-500/60 text-orange-300'
                    : 'bg-[#181818] border-[#2a2a2a] text-[#888] hover:border-[#3a3a3a]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold">Apenas Amigos</span>
                <span className="text-[9px] text-[#666] text-center">Visível só para amigos</span>
              </button>

              <button
                type="button"
                onClick={() => setPrivacy('private')}
                className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                  privacy === 'private'
                    ? 'bg-orange-950/40 border-orange-500/60 text-orange-300'
                    : 'bg-[#181818] border-[#2a2a2a] text-[#888] hover:border-[#3a3a3a]'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span className="text-xs font-bold">Privado</span>
                <span className="text-[9px] text-[#666] text-center">Oculto de buscas públicas</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!usernameStatus.valid || usernameStatus.available === false || isSubmitting}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 px-4 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-950/50 text-sm disabled:opacity-50 mt-4"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Salvando Perfil...
              </span>
            ) : (
              <>
                <span>Concluir e Entrar na Arena</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
