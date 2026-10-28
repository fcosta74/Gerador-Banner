import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  Download,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Package,
  Copy,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isWindows, isIOS, install } = usePWAInstall();
  const [tabAtiva, setTabAtiva] = useState<'pwa' | 'android_apk' | 'windows_exe'>('pwa');
  const [instalando, setInstalando] = useState(false);
  const [copiouLink, setCopiouLink] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalando(true);
    try {
      await install();
    } finally {
      setInstalando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">
                  Como Criar e Instalar o App no Windows e Android
                </h2>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  Multi-Plataforma
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Escolha abaixo o método ideal para transformar este gerador em aplicativo nativo.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 text-xs sm:text-sm overflow-x-auto">
          <button
            onClick={() => setTabAtiva('pwa')}
            className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              tabAtiva === 'pwa'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" /> 1. Instalação Direta (PWA Instantâneo)
          </button>
          <button
            onClick={() => setTabAtiva('android_apk')}
            className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              tabAtiva === 'android_apk'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" /> 2. Gerar APK / Android
          </button>
          <button
            onClick={() => setTabAtiva('windows_exe')}
            className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              tabAtiva === 'windows_exe'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4 text-blue-600" /> 3. Gerar .EXE / Windows
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-700 space-y-5">
          {/* TAB 1: PWA DIRETO */}
          {tabAtiva === 'pwa' && (
            <div className="space-y-5">
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-indigo-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    PWA (Progressive Web App) Já Habilitado no Código!
                  </h4>
                  <p className="text-xs text-indigo-900/80 mt-1 leading-relaxed">
                    Você e seus clientes não precisam baixar arquivos pesados nem passar por lojas. O aplicativo pode ser instalado diretamente pelo navegador no <strong>Windows</strong> e no <strong>Android</strong> com 1 clique.
                  </p>
                </div>

                {/* Botão de Instalação no Navegador */}
                {isInstalled ? (
                  <div className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow">
                    <CheckCircle className="w-4 h-4" /> Já Instalado neste Dispositivo!
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={handleInstallClick}
                    disabled={instalando}
                    className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shrink-0 shadow-lg shadow-indigo-500/25 transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    {instalando ? 'Instalando...' : 'Instalar Agora no Aparelho'}
                  </button>
                ) : (
                  <div className="text-xs text-slate-500 bg-white/80 px-3 py-2 rounded-xl border border-indigo-200">
                    Siga o guia abaixo para o seu navegador
                  </div>
                )}
              </div>

              {/* Link Direto do Aplicativo para Instalação */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <ExternalLink className="w-3.5 h-3.5" /> Link do seu App para Instalar no Celular e PC:
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                    Acesso Universal
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-slate-200 select-all overflow-x-auto truncate">
                    {typeof window !== 'undefined'
                      ? window.location.origin.includes('localhost')
                        ? 'https://ais-pre-fmj6io7eyargjpgn4zeufy-26078832980.us-east5.run.app'
                        : window.location.href
                      : 'https://ais-pre-fmj6io7eyargjpgn4zeufy-26078832980.us-east5.run.app'}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const link =
                        typeof window !== 'undefined'
                          ? window.location.origin.includes('localhost')
                            ? 'https://ais-pre-fmj6io7eyargjpgn4zeufy-26078832980.us-east5.run.app'
                            : window.location.href
                          : 'https://ais-pre-fmj6io7eyargjpgn4zeufy-26078832980.us-east5.run.app';
                      navigator.clipboard.writeText(link);
                      setCopiouLink(true);
                      setTimeout(() => setCopiouLink(false), 2500);
                    }}
                    className="py-2.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer shadow"
                  >
                    {copiouLink ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-white" /> Link Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copiar Link
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  📲 <strong>Como instalar no celular:</strong> Copie o link acima, envie no seu WhatsApp e abra no <strong>Google Chrome</strong> do celular. Toque nos 3 pontinhos e selecione <strong>"Instalar aplicativo"</strong>!
                </p>
              </div>

              {/* Grid Windows vs Android */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* No Windows */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3">
                  <div className="flex items-center gap-2 text-blue-600 font-bold">
                    <Monitor className="w-5 h-5" />
                    <h5 className="text-slate-900 font-bold text-base">No Windows (PC / Notebook)</h5>
                  </div>
                  <p className="text-xs text-slate-600">
                    Instala como uma janela nativa do Windows, com ícone na <strong>Área de Trabalho</strong> e no <strong>Menu Iniciar</strong>:
                  </p>
                  <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                    <li>Abra o link do app no <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong>.</li>
                    <li>
                      No topo da barra de endereços, clique no ícone de <strong>Instalar Aplicativo</strong> (ou clique no menu de 3 pontinhos &rarr; <em>"Instalar FCS Banners"</em>).
                    </li>
                    <li>Clique em <strong>Instalar</strong>.</li>
                    <li>Pronto! Ele abre em tela limpa, sem abas de navegador, fixado na barra de tarefas!</li>
                  </ol>
                </div>

                {/* No Android */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <Smartphone className="w-5 h-5" />
                    <h5 className="text-slate-900 font-bold text-base">No Android (Smartphones)</h5>
                  </div>
                  <p className="text-xs text-slate-600">
                    Cria o ícone direto na tela de aplicativos do seu celular, com abertura instantânea:
                  </p>
                  <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                    <li>Abra o link do app no <strong>Google Chrome</strong> do Android.</li>
                    <li>Toque no botão de <strong>3 pontinhos</strong> (canto superior direito).</li>
                    <li>
                      Selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                    </li>
                    <li>Toque em <strong>Instalar</strong>.</li>
                    <li>O app agora fica junto com seus outros aplicativos no celular!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GERAR APK ANDROID */}
          {tabAtiva === 'android_apk' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950">
                <h4 className="font-bold text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  Como Gerar o Arquivo .APK para Android (ou Google Play Store)
                </h4>
                <p className="text-xs text-emerald-900/80 mt-1 leading-relaxed">
                  Como este aplicativo já possui o <strong>manifest.json</strong>, <strong>ícones de alta resolução</strong> e <strong>Service Worker</strong> configurados, você pode gerar um instalador <code>.apk</code> oficial em menos de 2 minutos usando a ferramenta oficial da Microsoft (<strong>PWABuilder</strong>).
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 items-start p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900 text-sm block">Acesse o PWABuilder (Gratuito)</strong>
                    <p className="text-xs text-slate-600 mt-1">
                      Entre em <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold underline inline-flex items-center gap-1">pwabuilder.com <ExternalLink className="w-3 h-3" /></a>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900 text-sm block">Cole a URL do seu Aplicativo</strong>
                    <p className="text-xs text-slate-600 mt-1">
                      Cole a URL do seu site publicado (ex: no Vercel ou Cloud Run) e clique em <strong>"Start"</strong>. O PWABuilder testará seu manifest e dará nota máxima (tudo verde!).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900 text-sm block">Clique em "Package for Android"</strong>
                    <p className="text-xs text-slate-600 mt-1">
                      Na aba Android, clique em <strong>"Package"</strong>. Ele permite:
                    </p>
                    <ul className="text-xs text-slate-700 list-disc list-inside mt-1.5 space-y-1">
                      <li>Baixar o arquivo <strong>.apk</strong> para instalar direto em qualquer celular Android via WhatsApp ou cabo.</li>
                      <li>Baixar o pacote <strong>.aab (Android App Bundle)</strong> pronto para publicar na Google Play Store.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <strong className="text-slate-900 text-sm block">Alternativa para Desenvolvedores: Bubblewrap (Google CLI)</strong>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Se você preferir gerar pelo terminal no seu computador, o Google possui a ferramenta oficial <strong>Bubblewrap</strong>:
                    </p>
                    <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-xl font-mono text-xs mt-2">
                      <code>npx @bubblewrap/cli init --manifest=https://seusite.com/manifest.webmanifest</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GERAR EXE WINDOWS */}
          {tabAtiva === 'windows_exe' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-950">
                <h4 className="font-bold text-base flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  Como Gerar Instalador Executável (.EXE ou .MSIX) para Windows
                </h4>
                <p className="text-xs text-blue-900/80 mt-1 leading-relaxed">
                  Existem 2 maneiras profissionais de transformar este projeto em um executável para Windows:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Opção A: PWABuilder Windows */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Opção Mais Fácil (Sem Código)
                  </span>
                  <h5 className="font-bold text-slate-900 text-sm">PWABuilder (Pacote MSIX / Windows Store)</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    No site <strong>pwabuilder.com</strong>, após colocar a URL do seu site, clique em <strong>"Package for Windows"</strong>. O site gera automaticamente um pacote <code>.msix</code> que instala com dois cliques no Windows 10 e Windows 11.
                  </p>
                </div>

                {/* Opção B: Tauri (Já configurado neste projeto!) */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Tauri Já Configurado! (.EXE Nativo)
                  </span>
                  <h5 className="font-bold text-slate-900 text-sm">Compilar .EXE com Tauri</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    O <code>@tauri-apps/cli</code> e a pasta <code>src-tauri</code> já estão criados e configurados com a logo da FCS! No seu computador, basta executar:
                  </p>
                  <div className="bg-slate-900 text-emerald-300 p-2.5 rounded-xl font-mono text-[11px] mt-2 space-y-1">
                    <div><code>npm run tauri dev</code> <span className="text-slate-500">// Testa a janela</span></div>
                    <div><code>npm run tauri build</code> <span className="text-slate-500">// Gera o instalador .exe</span></div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1">
                <strong>💡 Dica Recomendada:</strong>
                <p className="leading-relaxed">
                  Para começar imediatamente, a <strong>Instalação PWA (Aba 1)</strong> é a mais recomendada, pois não exige aprovação em lojas, atualiza automaticamente quando você mudar o código e não ocupa quase nada de espaço na memória do computador ou celular.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            FCS Banners • Windows 10/11 & Android 8+
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
