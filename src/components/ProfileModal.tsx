import React, { useState } from 'react';
import { Award, Check, Cloud, CloudDownload, Copy, Crown, Download, Flame, Loader2, RefreshCw, Sparkles, Trophy, Upload, User, X } from 'lucide-react';
import { UserState } from '../types';
import { StorageService } from '../services/storageService';

interface ProfileModalProps {
  userState: UserState;
  onUpdateProfile: (updates: Partial<UserState>) => void;
  onImportState: (imported: UserState) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  userState,
  onUpdateProfile,
  onImportState,
  onClose,
}) => {
  const [name, setName] = useState<string>(userState.name || 'Matemático');
  const [email, setEmail] = useState<string>(userState.email || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(userState.avatar || '🦊');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Cloud restore state
  const [restoreIdentifier, setRestoreIdentifier] = useState<string>(userState.email || '');
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoreMessage, setRestoreMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Transfer code state
  const [transferCodeInput, setTransferCodeInput] = useState<string>('');
  const [showTransferInput, setShowTransferInput] = useState<boolean>(false);

  const avatars = ['🦊', '🦁', '🐯', '🦅', '🦉', '⚡', '🚀', '💎', '👑', '🎯', '🧠', '🤖', '🔮', '🌟', '🦄', '🐲'];

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = name.trim().length > 0 ? name.trim() : 'Matemático';
    const finalEmail = email.trim().toLowerCase();
    setName(finalName);
    setEmail(finalEmail);
    onUpdateProfile({
      name: finalName,
      email: finalEmail,
      avatar: selectedAvatar,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  const handleCopyId = () => {
    if (userState?.id) {
      navigator.clipboard.writeText(userState.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const handleRestoreFromCloud = async (overrideId?: string) => {
    const idToSearch = (overrideId || restoreIdentifier || email).trim();
    if (!idToSearch) {
      setRestoreMessage({
        text: 'Por favor, digite seu E-mail ou ID de Jogador.',
        success: false,
      });
      return;
    }

    setIsRestoring(true);
    setRestoreMessage(null);
    try {
      const result = await StorageService.restoreFromCloud(idToSearch, userState);
      if (result.success && result.state) {
        onImportState(result.state);
        setRestoreMessage({ text: result.message, success: true });
      } else {
        setRestoreMessage({ text: result.message, success: false });
      }
    } catch (e) {
      setRestoreMessage({
        text: 'Erro ao conectar à nuvem. Verifique sua conexão.',
        success: false,
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(userState, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matematica_progresso_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed.level === 'number') {
          const merged = StorageService.mergeUserStates(userState, parsed);
          onImportState(merged);
          setRestoreMessage({
            text: `Backup importado! Nível ${merged.level} e ${Object.keys(merged.achievements || {}).length} Conquistas recuperadas.`,
            success: true,
          });
        }
      } catch {
        setRestoreMessage({ text: 'Arquivo de backup inválido.', success: false });
      }
    };
    reader.readAsText(file);
  };

  const handleImportTransferCode = () => {
    if (!transferCodeInput.trim()) return;
    try {
      let rawJson = transferCodeInput.trim();
      if (rawJson.startsWith('MATH_')) {
        rawJson = atob(rawJson.replace('MATH_', ''));
      }
      const parsed = JSON.parse(rawJson);
      if (parsed && typeof parsed.level === 'number') {
        const merged = StorageService.mergeUserStates(userState, parsed);
        onImportState(merged);
        setShowTransferInput(false);
        setRestoreMessage({
          text: `Código aplicado com sucesso! ${Object.keys(merged.achievements || {}).length} conquistas recuperadas.`,
          success: true,
        });
      } else {
        setRestoreMessage({ text: 'Código de transferência inválido.', success: false });
      }
    } catch {
      setRestoreMessage({ text: 'Formato de código inválido.', success: false });
    }
  };

  const handleCopyTransferCode = () => {
    const minified = JSON.stringify(userState);
    const code = `MATH_${btoa(minified)}`;
    navigator.clipboard.writeText(code);
    setRestoreMessage({
      text: 'Código de transferência copiado! Cole no outro dispositivo para restaurar tudo.',
      success: true,
    });
  };

  const unlockedCount = Object.keys(userState.achievements || {}).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111] border border-[#222] rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-black text-white">Perfil do Jogador & Nuvem</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#888] hover:text-white rounded-lg hover:bg-[#222] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1 scrollbar-none">
          {/* Status Message */}
          {restoreMessage && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold border flex items-start gap-2 ${
                restoreMessage.success
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{restoreMessage.text}</span>
            </div>
          )}

          {/* Cloud Recovery Card (Priority Fix for App Switch) */}
          <div className="bg-[#161616] rounded-2xl p-4 border border-orange-500/40 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudDownload className="w-4 h-4 text-orange-400" />
                <span className="text-xs uppercase tracking-[0.15em] font-bold text-white">
                  Recuperar Conquistas na Nuvem
                </span>
              </div>
              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-bold uppercase">
                Sincronização
              </span>
            </div>
            <p className="text-[11px] text-[#aaa] leading-relaxed">
              Trocou de navegador, abriu no celular ou instalou o App Android? Digite seu <strong>E-mail</strong> ou <strong>ID de Jogador</strong> para trazer todas as suas conquistas de volta.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={restoreIdentifier}
                onChange={(e) => setRestoreIdentifier(e.target.value)}
                placeholder="Seu e-mail ou ID (ex: seu@email.com)"
                className="flex-1 bg-[#111] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
              />
              <button
                type="button"
                onClick={() => handleRestoreFromCloud()}
                disabled={isRestoring}
                className="py-2 px-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isRestoring ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Cloud className="w-3.5 h-3.5" />
                )}
                <span>{isRestoring ? 'Restaurando...' : 'Restaurar'}</span>
              </button>
            </div>
          </div>

          {/* Avatar selection */}
          <div className="bg-[#161616] rounded-2xl p-4 border border-[#222] space-y-3">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#888] block">Escolha seu Avatar</span>
            <div className="grid grid-cols-8 gap-2">
              {avatars.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                    selectedAvatar === av
                      ? 'bg-orange-600 ring-2 ring-orange-500 scale-110 shadow-md'
                      : 'bg-[#111] hover:bg-[#222] border border-[#222]'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Name and Email Form */}
          <form onSubmit={handleSave} className="bg-[#161616] rounded-2xl p-4 border border-[#222] space-y-3">
            <div>
              <label htmlFor="player-name-input" className="text-xs uppercase tracking-[0.2em] font-bold text-[#888] block mb-1">
                Nome do Jogador
              </label>
              <input
                id="player-name-input"
                type="text"
                value={name}
                maxLength={24}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-bold"
                placeholder="Digite seu nome"
                autoComplete="nickname"
              />
            </div>

            <div>
              <label htmlFor="player-email-input" className="text-xs uppercase tracking-[0.2em] font-bold text-[#888] block mb-1">
                E-mail da Conta (Para sincronização automática)
              </label>
              <input
                id="player-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                placeholder="exemplo@gmail.com"
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : null}
              <span>{isSaved ? 'Perfil e E-mail Salvos na Nuvem!' : 'Salvar Alterações'}</span>
            </button>
          </form>

          {/* Player stats recap */}
          <div className="bg-[#161616] rounded-2xl p-4 border border-[#222] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#888]">Resumo da Carreira</span>
              <span className="text-xs font-bold text-orange-400">{unlockedCount} Conquistas</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#111] p-2.5 rounded-xl border border-[#222]">
                <span className="text-[#666] block text-[10px] uppercase tracking-wider font-bold">Rank Atual</span>
                <span className="font-black text-orange-400">{userState.rank.fullName}</span>
              </div>
              <div className="bg-[#111] p-2.5 rounded-xl border border-[#222]">
                <span className="text-[#666] block text-[10px] uppercase tracking-wider font-bold">Nível</span>
                <span className="font-black text-white font-mono">Nível {userState.level}</span>
              </div>
              <div className="bg-[#111] p-2.5 rounded-xl border border-[#222]">
                <span className="text-[#666] block text-[10px] uppercase tracking-wider font-bold">XP Total</span>
                <span className="font-black text-orange-400 font-mono">{userState.totalXP.toLocaleString()} XP</span>
              </div>
              <div className="bg-[#111] p-2.5 rounded-xl border border-[#222]">
                <span className="text-[#666] block text-[10px] uppercase tracking-wider font-bold">Maior Streak</span>
                <span className="font-black text-white font-mono">{userState.streak.maxStreak} dias</span>
              </div>
            </div>

            {/* Copyable Player ID */}
            <div className="mt-2 pt-2 border-t border-[#222] flex items-center justify-between bg-[#111] p-2 rounded-xl">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-[#666] uppercase font-bold block">Seu ID de Jogador</span>
                <span className="text-xs font-mono text-[#aaa] truncate block">{userState.id}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1.5 px-2.5 rounded-lg bg-[#222] hover:bg-[#333] text-xs font-bold text-white flex items-center gap-1 shrink-0 transition cursor-pointer"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Backup, Transfer Code & Restore */}
          <div className="bg-[#161616] rounded-2xl p-4 border border-[#222] space-y-2.5">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#888] block">Transferência Manual & Backup</span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyTransferCode}
                className="py-2.5 px-3 rounded-xl bg-[#111] hover:bg-[#222] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition border border-[#333] cursor-pointer"
                title="Copia um código com todas as suas conquistas para colar no celular"
              >
                <Copy className="w-3.5 h-3.5 text-orange-400" />
                Copiar Código
              </button>

              <button
                onClick={() => setShowTransferInput(!showTransferInput)}
                className="py-2.5 px-3 rounded-xl bg-[#111] hover:bg-[#222] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition border border-[#333] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Colar Código
              </button>
            </div>

            {showTransferInput && (
              <div className="space-y-2 pt-2 animate-in fade-in">
                <textarea
                  value={transferCodeInput}
                  onChange={(e) => setTransferCodeInput(e.target.value)}
                  placeholder="Cole aqui o código de transferência ou JSON..."
                  className="w-full h-16 bg-[#111] border border-[#333] rounded-xl p-2 text-[10px] font-mono text-white focus:outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={handleImportTransferCode}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Aplicar Código e Restaurar Conquistas
                </button>
              </div>
            )}

            <div className="flex gap-2 pt-1 border-t border-[#222]">
              <button
                onClick={handleExportBackup}
                className="flex-1 py-2 px-3 rounded-xl bg-[#111] hover:bg-[#222] text-[#aaa] hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition border border-[#222] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar Arquivo .JSON
              </button>
              <label className="flex-1 py-2 px-3 rounded-xl bg-[#111] hover:bg-[#222] text-[#aaa] hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition border border-[#222] cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5" />
                Importar Arquivo
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


