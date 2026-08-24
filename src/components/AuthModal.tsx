import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, KeyRound, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { AuthService } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  initialMode?: 'login' | 'signup';
  onOpenRecovery?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  onOpenRecovery,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    if (mode === 'forgot') {
      try {
        setLoading(true);
        await AuthService.sendPasswordReset(email.trim());
        setSuccessMessage('E-mail de redefinição de senha enviado! Verifique sua caixa de entrada.');
      } catch (err: any) {
        setError(AuthService.getFriendlyErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Por favor, informe sua senha.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('A senha deve conter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas digitadas não coincidem.');
        return;
      }
    }

    try {
      setLoading(true);
      let user;
      if (mode === 'signup') {
        user = await AuthService.registerWithEmail(email, password);
      } else {
        user = await AuthService.loginWithEmail(email, password);
      }
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(AuthService.getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      setLoading(true);
      const user = await AuthService.loginWithGoogle();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(AuthService.getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#141414] border border-[#262626] rounded-2xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#777] hover:text-white p-1 rounded-lg hover:bg-[#222] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-950/60 border border-orange-500/30 text-orange-400 mb-3 text-2xl">
            ∑
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {mode === 'login' && 'Entrar na Conta'}
            {mode === 'signup' && 'Criar Conta'}
            {mode === 'forgot' && 'Recuperar Senha'}
          </h2>
          <p className="text-xs text-[#999] mt-1">
            {mode === 'login' && 'Acesse seus níveis, ranks, apostilas e progresso pessoal.'}
            {mode === 'signup' && 'Cadastre-se para proteger e sincronizar sua jornada.'}
            {mode === 'forgot' && 'Informe seu e-mail para redefinir sua senha com segurança.'}
          </p>
        </div>

        {/* Google 1-Click Login Button */}
        {mode !== 'forgot' && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#1e1e1e] hover:bg-[#282828] text-white border border-[#333] font-bold py-3 px-4 rounded-xl transition cursor-pointer disabled:opacity-50 text-sm shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.7 0 3 .7 3.9 1.5l2.9-2.9C17 2 14.7 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 12.2 0 15c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 15.9C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              Continuar com Google
            </button>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-[#2a2a2a]" />
              <span className="px-3 text-[11px] font-mono text-[#666] uppercase tracking-wider">ou com e-mail</span>
              <div className="flex-1 border-t border-[#2a2a2a]" />
            </div>
          </div>
        )}

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-600/40 rounded-xl flex items-start gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-600/40 rounded-xl flex items-start gap-2 text-emerald-300 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#666] absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                className="w-full bg-[#1c1c1c] border border-[#333] rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-[#555] focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888]">
                  Senha
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-[11px] text-orange-400 hover:text-orange-300 font-medium"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#666] absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-[#555] focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888] mb-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#666] absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-[#555] focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 text-sm disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando...
              </span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" /> Entrar
              </>
            ) : mode === 'signup' ? (
              <>
                <UserPlus className="w-4 h-4" /> Criar Conta
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" /> Enviar Link de Recuperação
              </>
            )}
          </button>
        </form>

        {/* Footer Mode Switcher */}
        <div className="mt-6 pt-4 border-t border-[#222] text-center text-xs text-[#888]">
          {mode === 'login' && (
            <p>
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-orange-400 hover:text-orange-300 font-bold ml-1"
              >
                Cadastre-se gratuitamente
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Já possui uma conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-orange-400 hover:text-orange-300 font-bold ml-1"
              >
                Faça login
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-orange-400 hover:text-orange-300 font-bold"
            >
              Voltar ao Login
            </button>
          )}
        </div>

        {/* Recovery Link */}
        {onOpenRecovery && (
          <div className="mt-4 pt-3 border-t border-[#222] text-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRecovery();
              }}
              className="text-xs text-orange-400 hover:text-orange-300 font-bold underline underline-offset-2 cursor-pointer"
            >
              Já jogava antes e perdeu seu Nível / XP? Recuperar conta original
            </button>
          </div>
        )}

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-[#666]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Autenticação segura via Firebase Auth (sem armazenamento manual de senhas)</span>
        </div>
      </div>
    </div>
  );
};
