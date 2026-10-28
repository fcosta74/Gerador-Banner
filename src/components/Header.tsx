import React from 'react';
import { ShoppingBag, Sparkles, Code2, ShieldCheck, Flame, Download, Smartphone, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  onOpenApiModal: () => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenApiModal, onOpenInstallModal }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleInstallClick = async (e: React.MouseEvent) => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) onOpenInstallModal();
    } else {
      onOpenInstallModal();
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-lg sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo FCS Oficial e Título */}
        <div className="flex items-center gap-3.5">
          <div className="bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 shadow-md flex items-center justify-center shrink-0">
            <img
              src="/img/logofcs.png"
              alt="Logo FCS"
              className="h-11 w-auto max-w-[64px] object-contain drop-shadow"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight text-white">
                FCS Banners
              </span>
              <span className="bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Shopee, ML & KaBuM
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              Gerador de Banners Promocionais
            </p>
          </div>
        </div>

        {/* Ações do Header */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          {/* Botão de Instalar no Windows & Android */}
          <button
            type="button"
            onClick={handleInstallClick}
            className="py-2.5 px-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md shadow-indigo-600/20 cursor-pointer"
            title="Instalar aplicativo no Windows ou Android"
          >
            <Download className="w-4 h-4 text-indigo-200" />
            <span>
              {isInstalled
                ? 'App Instalado (Opções)'
                : isInstallable
                ? 'Instalar Aplicativo'
                : 'App Windows & Android'}
            </span>
            <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
              APK / EXE
            </span>
          </button>

          {/* Botão Código da API Vercel */}
          <button
            type="button"
            onClick={onOpenApiModal}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-orange-400" />
            <span>Código da API</span>
          </button>
        </div>
      </div>
    </header>
  );
};
