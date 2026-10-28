import React, { useRef, useEffect, useState } from 'react';
import { Download, Copy, Check, ZoomIn, ZoomOut, Maximize2, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProdutoData } from '../types';
import { desenharBanner } from '../utils/canvasRenderer';

interface BannerPreviewProps {
  dados: ProdutoData;
  isDesenhando?: boolean;
}

export const BannerPreview: React.FC<BannerPreviewProps> = ({ dados }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(45); // default zoom percentage for preview
  const [baixando, setBaixando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [renderizando, setRenderizando] = useState(false);

  // Redesenha sempre que os dados mudarem
  useEffect(() => {
    let ativo = true;

    const render = async () => {
      if (!canvasRef.current) return;
      setRenderizando(true);
      try {
        await desenharBanner(canvasRef.current, dados);
      } catch (err) {
        console.error('Erro ao renderizar banner no canvas:', err);
      } finally {
        if (ativo) setRenderizando(false);
      }
    };

    render();

    return () => {
      ativo = false;
    };
  }, [
    dados.loja,
    dados.descricao,
    dados.precoOriginal,
    dados.precoVista,
    dados.parcelado,
    dados.cupom,
    dados.avaliacao,
    dados.avaliacoesQtd,
    dados.frete,
    dados.whatsapp,
    dados.imagemUrl,
    dados.imagemLocal,
  ]);

  const handleBaixar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setBaixando(true);
    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      link.download = `banner-${dados.loja}-fcs-${timestamp}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Erro ao baixar banner:', err);
      alert(
        'Não foi possível exportar a imagem automaticamente (bloqueio CORS da imagem da loja). Faça o upload manual da imagem do produto no campo correspondente para baixar sem restrições.'
      );
    } finally {
      setBaixando(false);
    }
  };

  const handleCopiarImagem = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Falha ao gerar blob do canvas');
        // @ts-ignore
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setCopiado(true);
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.7 },
        });
        setTimeout(() => setCopiado(false), 2500);
      }, 'image/png');
    } catch (err) {
      console.warn('Cópia de imagem para o clipboard não suportada neste navegador:', err);
      // Fallback: faz o download
      handleBaixar();
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-5 text-white flex flex-col items-center shadow-xl border border-slate-800 sticky top-6">
      {/* Barra de Ferramentas do Preview */}
      <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-slate-300">
            Pré-Visualização (1080 x 1500)
          </span>
          {renderizando && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1 animate-pulse ml-2">
              <RefreshCw className="w-3 h-3 animate-spin" /> Atualizando...
            </span>
          )}
        </div>

        {/* Controles de Zoom */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(25, z - 10))}
            className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 font-mono text-[11px] font-semibold text-slate-300">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(100, z + 10))}
            className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(45)}
            className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition"
            title="Resetar Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Área do Canvas com Scroll e Zoom */}
      <div className="w-full flex justify-center items-center overflow-auto max-h-[620px] p-2 bg-slate-950/50 rounded-2xl border border-slate-800/80">
        <div
          style={{
            width: `${(1080 * zoom) / 100}px`,
            maxWidth: '100%',
            transition: 'width 0.15s ease-out',
          }}
          className="relative flex justify-center items-center shadow-2xl rounded-2xl overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            id="bannerCanvas"
            className="w-full h-auto block rounded-2xl"
          />
        </div>
      </div>

      {/* Botões de Ação do Banner */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
        <button
          type="button"
          onClick={handleBaixar}
          disabled={baixando}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
        >
          <Download className="w-5 h-5" />
          {baixando ? 'Gerando Imagem...' : 'Baixar Banner (PNG)'}
        </button>

        <button
          type="button"
          onClick={handleCopiarImagem}
          className={`w-full py-3.5 px-4 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer border ${
            copiado
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 active:scale-[0.98]'
          }`}
        >
          {copiado ? (
            <>
              <Check className="w-5 h-5 text-emerald-400" /> Banner Copiado!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" /> Copiar Imagem
            </>
          )}
        </button>
      </div>

      <div className="w-full mt-3 flex items-center justify-center gap-2 text-slate-400 text-[11px]">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span>Resolução ultra-nítida: 1080 x 1500 pixels (Proporção 9:16)</span>
      </div>
    </div>
  );
};
