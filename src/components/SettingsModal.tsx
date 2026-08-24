import React, { useState } from 'react';
import { Moon, RefreshCw, Settings, Sliders, Smartphone, Sun, Vibrate, Volume2, VolumeX, X } from 'lucide-react';
import { OperationType, UserSettings, UserState } from '../types';

interface SettingsModalProps {
  userState: UserState;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onResetProgress: () => void;
  onClose: () => void;
  onOpenAndroidInstall?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  userState,
  onUpdateSettings,
  onResetProgress,
  onClose,
  onOpenAndroidInstall,
}) => {
  const [settings, setSettings] = useState<UserSettings>({ ...userState.settings });
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const handleToggle = (field: keyof UserSettings) => {
    const updated = { ...settings, [field]: !settings[field] };
    setSettings(updated);
    onUpdateSettings(updated);
  };

  const handleOperationToggle = (op: OperationType) => {
    let currentOps = [...settings.enabledOperations];
    if (currentOps.includes(op)) {
      if (currentOps.length > 1) {
        currentOps = currentOps.filter((o) => o !== op);
      }
    } else {
      currentOps.push(op);
    }
    const updated = { ...settings, enabledOperations: currentOps };
    setSettings(updated);
    onUpdateSettings(updated);
  };

  const handleVolumeChange = (vol: number) => {
    const updated = { ...settings, soundVolume: vol };
    setSettings(updated);
    onUpdateSettings(updated);
  };

  const handleDailyGoalChange = (goal: number) => {
    const updated = { ...settings, dailyGoal: goal };
    setSettings(updated);
    onUpdateSettings(updated);
  };

  const handleTimerDurationChange = (seconds: number) => {
    const updated = { ...settings, timerDurationSeconds: seconds };
    setSettings(updated);
    onUpdateSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-[#111] border border-[#222] rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-black text-white">Configurações</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#888] hover:text-white rounded-lg hover:bg-[#222] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1 scrollbar-none">
          {/* Sound & Audio Effects */}
          <div className="bg-[#161616] rounded-2xl p-3.5 border border-[#222] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-orange-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#555]" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-white">Efeitos Sonoros</h4>
                  <p className="text-[11px] text-[#888]">Sons de cliques, acertos e combos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('soundEnabled')}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.soundEnabled ? 'bg-orange-600' : 'bg-[#333]'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {settings.soundEnabled && (
              <div className="pt-2 border-t border-[#222] flex items-center gap-3">
                <span className="text-xs text-[#888]">Volume:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 accent-orange-500 cursor-pointer"
                />
                <span className="text-xs font-mono text-white w-8 text-right">
                  {Math.round(settings.soundVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Haptic Vibration */}
          <div className="bg-[#161616] rounded-2xl p-3.5 border border-[#222] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Vibrate className="w-4 h-4 text-orange-500" />
              <div>
                <h4 className="text-sm font-bold text-white">Vibração Háptica</h4>
                <p className="text-[11px] text-[#888]">Feedback tátil ao digitar e acertar</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('vibrationEnabled')}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.vibrationEnabled ? 'bg-orange-600' : 'bg-[#333]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.vibrationEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Daily Goal Target */}
          <div className="bg-[#161616] rounded-2xl p-3.5 border border-[#222] space-y-2">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#888]">Meta Diária (Questões/dia)</h4>
            <div className="grid grid-cols-5 gap-1.5">
              {[5, 10, 15, 20, 30].map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleDailyGoalChange(goal)}
                  className={`py-2 rounded-xl text-xs font-black font-mono transition border cursor-pointer ${
                    settings.dailyGoal === goal
                      ? 'bg-orange-600 text-white border-orange-500'
                      : 'bg-[#111] text-[#888] border-[#222] hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Question Timer Duration */}
          <div className="bg-[#161616] rounded-2xl p-3.5 border border-[#222] space-y-2">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#888]">Tempo por Questão</h4>
            <div className="grid grid-cols-4 gap-1.5">
              {[15, 30, 45, 60].map((sec) => (
                <button
                  key={sec}
                  onClick={() => handleTimerDurationChange(sec)}
                  className={`py-2 rounded-xl text-xs font-black font-mono transition border cursor-pointer ${
                    settings.timerDurationSeconds === sec
                      ? 'bg-orange-600 text-white border-orange-500'
                      : 'bg-[#111] text-[#888] border-[#222] hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Enabled Operations Filter */}
          <div className="bg-[#161616] rounded-2xl p-3.5 border border-[#222] space-y-2">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#888]">Operações Permitidas</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'addition', label: 'Adição (+)' },
                { id: 'subtraction', label: 'Subtração (-)' },
                { id: 'multiplication', label: 'Multiplicação (×)' },
                { id: 'division', label: 'Divisão (÷)' },
              ].map((op) => {
                const isChecked = settings.enabledOperations.includes(op.id as OperationType);
                return (
                  <button
                    key={op.id}
                    onClick={() => handleOperationToggle(op.id as OperationType)}
                    className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border cursor-pointer ${
                      isChecked
                        ? 'bg-orange-950/40 border-orange-500/50 text-white'
                        : 'bg-[#111] border-[#222] text-[#666]'
                    }`}
                  >
                    <span>{op.label}</span>
                    <span className={`w-3.5 h-3.5 rounded-full ${isChecked ? 'bg-orange-500' : 'bg-[#333]'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Android App Installation Card */}
          {onOpenAndroidInstall && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAndroidInstall();
              }}
              className="w-full bg-[#181818] hover:bg-[#202020] rounded-2xl p-3.5 border border-emerald-900/40 hover:border-emerald-500/50 flex items-center justify-between transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Instalar no Android (APK / PWA)</h4>
                  <p className="text-[11px] text-[#888]">Usar em tela cheia no smartphone</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30 uppercase">
                Ver Guia
              </span>
            </button>
          )}

          {/* Danger Zone: Reset Progress */}
          <div className="pt-2 border-t border-[#222]">
            {showResetConfirm ? (
              <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-3 text-center space-y-2">
                <p className="text-xs text-rose-300 font-medium">
                  Tem certeza? Isso apagará todos os seus pontos de XP, níveis e histórico de sequência.
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={onResetProgress}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 cursor-pointer"
                  >
                    Sim, Reiniciar Tudo
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 rounded-xl bg-[#222] text-[#888] text-xs font-semibold hover:bg-[#333] cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reiniciar Progresso da Conta
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

