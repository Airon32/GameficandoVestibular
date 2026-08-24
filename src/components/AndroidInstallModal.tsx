import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Share2, Sparkles, CheckCircle2, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface AndroidInstallModalProps {
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  useEffect(() => {
    // Listen for Android PWA install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#121212] border border-[#262626] rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#222] flex items-center justify-between bg-[#171717]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Publicar & Instalar no Android</h2>
              <p className="text-xs text-[#888]">
                Instale diretamente no seu smartphone Android ou gere um arquivo APK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#888] hover:text-white hover:bg-[#222] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Method 1: Instant PWA Android App */}
          <div className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a] relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-500/30">
                Opção 1 (Recomendada • Imediata)
              </span>
              <span className="text-xs text-[#888]">Instalação Direta no Celular</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Instalar como Aplicativo Nativo (PWA)</h3>
            <p className="text-sm text-[#aaa] leading-relaxed mb-4">
              O aplicativo já está configurado com <strong>Web App Manifest</strong>, ícones dedicados e <strong>Service Worker</strong> para rodar em tela cheia no Android sem barra de navegador.
            </p>

            <div className="space-y-2.5 text-xs text-[#ccc] bg-[#111] p-4 rounded-xl border border-[#222] mb-4">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-600/30 text-orange-400 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                <span>Abra este link no navegador <strong>Google Chrome</strong> do seu smartphone Android.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-600/30 text-orange-400 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                <span>Toque no menu de três pontos <strong>⋮</strong> no canto superior direito do Chrome.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-600/30 text-orange-400 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                <span>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5 pt-2 border-t border-[#222] text-emerald-400 font-medium">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Suas conquistas e XP são sincronizados via Firebase! Caso abra pela 1ª vez no app, clique no seu perfil para restaurar com seu E-mail ou Código.</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar Agora no Android</span>
                </button>
              )}
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-[#222] hover:bg-[#333] text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer border border-[#333]"
              >
                <Share2 className="w-4 h-4 text-orange-400" />
                <span>{copiedUrl ? 'Link Copiado!' : 'Copiar Link do App'}</span>
              </button>
            </div>
          </div>

          {/* Method 2: Google Play Store / APK Generation via Capacitor */}
          <div className="p-5 rounded-2xl bg-[#181818] border border-[#2a2a2a]">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-orange-500/30">
                Opção 2 • Desenvolvedor
              </span>
              <span className="text-xs text-[#888]">Gerar Pacote APK / AAB para Google Play Store</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Compilar Pacote APK Android (Capacitor / TWA)</h3>
            <p className="text-sm text-[#aaa] leading-relaxed mb-3">
              Para publicar oficialmente na <strong>Google Play Store</strong> como um arquivo `.apk` ou `.aab`:
            </p>

            <div className="bg-[#0e0e0e] p-3.5 rounded-xl border border-[#222] font-mono text-[11px] text-[#ccc] space-y-1.5 mb-3 overflow-x-auto">
              <div className="text-[#888]"># 1. Exporte o projeto (botão Exportar no topo do AI Studio)</div>
              <div>npm install @capacitor/core @capacitor/cli @capacitor/android</div>
              <div>npx cap init "Matematica Gamificada" "com.numeris.matematica"</div>
              <div>npm run build</div>
              <div>npx cap add android</div>
              <div>npx cap open android <span className="text-[#888]"># Abre o Android Studio para gerar o APK</span></div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#888]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>O app já inclui suporte offline, banco Firebase e design mobile-first responsivo.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222] bg-[#171717] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#222] hover:bg-[#333] text-white text-sm font-bold transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
