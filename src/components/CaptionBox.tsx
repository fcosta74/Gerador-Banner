import React, { useState } from 'react';
import { Copy, Check, Share2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProdutoData } from '../types';

interface CaptionBoxProps {
  dados: ProdutoData;
}

export const CaptionBox: React.FC<CaptionBoxProps> = ({ dados }) => {
  const [copiado, setCopiado] = useState(false);

  const nomesLojas = {
    shopee: 'SHOPEE BRASIL',
    mercadolivre: 'MERCADO LIVRE',
    kabum: 'KABUM!',
  };

  const montarTextoLegenda = (): string => {
    const nomeLoja = nomesLojas[dados.loja] || 'OFERTA IMPERDÍVEL';
    let texto = `🔥 *OFERTA IMPERDÍVEL - ${nomeLoja}* 🔥\n\n`;

    if (dados.descricao) {
      texto += `🛍️ *${dados.descricao.trim()}*\n\n`;
    }

    if (dados.avaliacao && dados.avaliacao !== '0') {
      const qtdTexto = dados.avaliacoesQtd ? ` (${dados.avaliacoesQtd} opiniões de clientes)` : '';
      texto += `⭐ *Avaliação:* ${dados.avaliacao} / 5.0${qtdTexto}\n\n`;
    }

    if (dados.precoOriginal) {
      texto += `❌ De: ~R$ ${dados.precoOriginal}~\n`;
    }

    if (dados.precoVista && dados.precoVista !== '0,00') {
      texto += `✅ *Por apenas: R$ ${dados.precoVista} no PIX* 💥\n`;
    }

    if (dados.parcelado) {
      texto += `💳 *Parcelamento:* ${dados.parcelado}\n`;
    }

    if (dados.cupom) {
      texto += `🎟️ *Cupom exclusivo:* ${dados.cupom.toUpperCase()}\n`;
    }

    if (dados.frete && dados.frete !== 'Selecione') {
      texto += `🚚 *Frete:* ${dados.frete}\n`;
    }

    texto += '\n';

    if (dados.url) {
      texto += `🛒 *Garanta o seu no link oficial:* \n${dados.url.trim()}\n\n`;
    }

    if (dados.whatsapp) {
      texto += `📲 *Dúvidas ou mais promoções:* ${dados.whatsapp}\n\n`;
    }

    texto += `⚠️ *Atenção:* Produto sujeito a alteração de preço e término de estoque sem aviso prévio.`;

    return texto;
  };

  const handleCopiar = () => {
    const texto = montarTextoLegenda();
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  const textoGerado = montarTextoLegenda();

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-base">
            Legenda Pronta para Redes Sociais
          </h3>
        </div>
        <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> WhatsApp & Telegram
        </span>
      </div>

      <textarea
        value={textoGerado}
        readOnly
        rows={7}
        className="w-full text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none resize-none leading-relaxed"
      />

      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={handleCopiar}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm ${
            copiado
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-[0.98]'
          }`}
        >
          {copiado ? (
            <>
              <Check className="w-4 h-4" /> Legenda Copiada com Sucesso!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copiar Legenda Formatada
            </>
          )}
        </button>
      </div>
    </div>
  );
};
