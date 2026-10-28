import React, { useRef } from 'react';
import {
  Link as LinkIcon,
  Search,
  RotateCcw,
  ShoppingBag,
  Star,
  Users,
  DollarSign,
  CreditCard,
  Tag,
  Truck,
  Phone,
  Image as ImageIcon,
  Upload,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { LojaTipo, ProdutoData } from '../types';

interface FormInputsProps {
  dados: ProdutoData;
  setDados: React.Dispatch<React.SetStateAction<ProdutoData>>;
  onBuscar: () => void;
  onLimpar: () => void;
  carregando: boolean;
  erroBusca: string | null;
  onCarregarExemplo: (loja: LojaTipo) => void;
}

export const FormInputs: React.FC<FormInputsProps> = ({
  dados,
  setDados,
  onBuscar,
  onLimpar,
  carregando,
  erroBusca,
  onCarregarExemplo,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Aplica máscara monetária simples (ex: "189990" -> "1.899,90")
  const formatarEntradaMoeda = (valor: string): string => {
    const apenasDigitos = valor.replace(/\D/g, '');
    if (!apenasDigitos) return '';
    const num = (parseFloat(apenasDigitos) / 100).toFixed(2);
    return num.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  };

  const handlePrecoChange = (campo: 'precoOriginal' | 'precoVista', valor: string) => {
    const formatado = formatarEntradaMoeda(valor);
    setDados((prev) => ({ ...prev, [campo]: formatado }));
  };

  // Auto-detecta a loja ao colar a URL
  const handleUrlChange = (urlDigitada: string) => {
    const urlLower = urlDigitada.toLowerCase();
    let novaLoja: LojaTipo = dados.loja;

    if (urlLower.includes('shopee.com') || urlLower.includes('shp.ee')) {
      novaLoja = 'shopee';
    } else if (
      urlLower.includes('mercadolivre.com') ||
      urlLower.includes('mercadolivre.com.br') ||
      urlLower.includes('ml.app') ||
      urlLower.includes('meli.la')
    ) {
      novaLoja = 'mercadolivre';
    } else if (urlLower.includes('kabum.com') || urlLower.includes('kabum.com.br')) {
      novaLoja = 'kabum';
    }

    setDados((prev) => ({
      ...prev,
      url: urlDigitada,
      loja: novaLoja,
    }));
  };

  // Upload manual de foto
  const handleUploadArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDados((prev) => ({
          ...prev,
          imagemLocal: event.target?.result as string,
          imagemFile: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
      {/* 1. SELEÇÃO DA LOJA */}
      <div>
        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
          1. Escolha a Loja / Marketplace:
        </label>
        <div className="grid grid-cols-3 gap-3">
          {/* Shopee */}
          <button
            type="button"
            onClick={() => setDados((p) => ({ ...p, loja: 'shopee' }))}
            className={`py-3 px-3 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-2 transition-all border-2 ${
              dados.loja === 'shopee'
                ? 'bg-orange-50 border-orange-500 shadow-md shadow-orange-500/20 scale-[1.02]'
                : 'bg-slate-50 border-slate-200 hover:bg-orange-50/50 hover:border-orange-200'
            }`}
          >
            <img
              src="/assets/aistudio/logoShopee_39913d0b.png"
              alt="Shopee"
              className="h-6 sm:h-7 max-w-[90%] object-contain"
            />
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                dados.loja === 'shopee'
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-100 text-orange-700'
              }`}
            >
              Shopee Oficial
            </span>
          </button>

          {/* Mercado Livre */}
          <button
            type="button"
            onClick={() => setDados((p) => ({ ...p, loja: 'mercadolivre' }))}
            className={`py-3 px-3 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-2 transition-all border-2 ${
              dados.loja === 'mercadolivre'
                ? 'bg-yellow-50 border-yellow-400 shadow-md shadow-yellow-500/20 scale-[1.02]'
                : 'bg-slate-50 border-slate-200 hover:bg-yellow-50/50 hover:border-yellow-200'
            }`}
          >
            <img
              src="/assets/aistudio/logoml_7050c8ff.png"
              alt="Mercado Livre"
              className="h-6 sm:h-7 max-w-[90%] object-contain"
            />
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                dados.loja === 'mercadolivre'
                  ? 'bg-indigo-950 text-yellow-300'
                  : 'bg-yellow-100 text-indigo-900'
              }`}
            >
              Mercado Livre
            </span>
          </button>

          {/* KaBuM! */}
          <button
            type="button"
            onClick={() => setDados((p) => ({ ...p, loja: 'kabum' }))}
            className={`py-3 px-3 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-2 transition-all border-2 ${
              dados.loja === 'kabum'
                ? 'bg-orange-50 border-orange-500 shadow-md shadow-orange-600/20 scale-[1.02]'
                : 'bg-slate-50 border-slate-200 hover:bg-orange-50/50 hover:border-orange-200'
            }`}
          >
            <img
              src="/img/logokabum.png"
              alt="KaBuM!"
              className="h-6 sm:h-7 max-w-[90%] object-contain"
            />
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                dados.loja === 'kabum'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-800'
              }`}
            >
              KaBuM! Gamer
            </span>
          </button>
        </div>
      </div>

      {/* 2. PUXAR DADOS PELO LINK */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-orange-500" />
            Puxar dados pelo link ({dados.loja === 'shopee' ? 'Shopee' : dados.loja === 'mercadolivre' ? 'Mercado Livre' : 'KaBuM!'}):
          </label>
          <span className="text-[11px] text-slate-500 font-medium">Auto-detecta a loja</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={dados.url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onBuscar();
              }
            }}
            placeholder={
              dados.loja === 'shopee'
                ? 'https://shopee.com.br/... ou https://s.shopee.com.br/...'
                : dados.loja === 'mercadolivre'
                ? 'https://produto.mercadolivre.com.br/MLB-...'
                : 'https://www.kabum.com.br/produto/...'
            }
            className="flex-1 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onBuscar}
              disabled={carregando}
              className="py-2.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Search className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} />
              {carregando ? 'Buscando...' : 'Buscar Dados'}
            </button>
            <button
              type="button"
              onClick={onLimpar}
              className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition cursor-pointer shrink-0"
              title="Limpar campos"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Limpar
            </button>
          </div>
        </div>

        {erroBusca && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erroBusca}</span>
          </div>
        )}

        {/* Exemplos Prontos para Teste Rápido */}
        <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Teste rápido:
          </span>
          <button
            type="button"
            onClick={() => onCarregarExemplo('shopee')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-orange-400 text-slate-700 hover:text-orange-600 font-medium transition text-[11px]"
          >
            🛍️ Exemplo Shopee
          </button>
          <button
            type="button"
            onClick={() => onCarregarExemplo('mercadolivre')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-yellow-500 text-slate-700 hover:text-indigo-900 font-medium transition text-[11px]"
          >
            🟡 Exemplo Mercado Livre
          </button>
          <button
            type="button"
            onClick={() => onCarregarExemplo('kabum')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-orange-500 text-slate-700 hover:text-orange-700 font-medium transition text-[11px]"
          >
            🟠 Exemplo KaBuM!
          </button>
        </div>
      </div>

      {/* 3. TÍTULO / DESCRIÇÃO DO PRODUTO */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700">
            Título / Descrição do Produto:
          </label>
          <span className="text-[11px] text-slate-400">
            {dados.descricao?.length || 0} caracteres
          </span>
        </div>
        <textarea
          rows={3}
          value={dados.descricao}
          onChange={(e) => setDados((p) => ({ ...p, descricao: e.target.value }))}
          placeholder="Ex: Fone de Ouvido Bluetooth Sem Fio com Cancelamento de Ruído Shopee..."
          className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500 transition shadow-sm resize-none"
        />
      </div>

      {/* 4. PREÇOS (DE e POR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            Preço De (R$ Riscado):
          </label>
          <input
            type="text"
            value={dados.precoOriginal}
            onChange={(e) => handlePrecoChange('precoOriginal', e.target.value)}
            placeholder="Ex: 299,90"
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500 transition shadow-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            Preço Por (R$ Principal / Pix):
          </label>
          <input
            type="text"
            value={dados.precoVista}
            onChange={(e) => handlePrecoChange('precoVista', e.target.value)}
            placeholder="Ex: 179,90"
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 transition shadow-sm"
          />
        </div>
      </div>

      {/* 5. PARCELAMENTO E CUPOM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            Parcelamento:
          </label>
          <input
            type="text"
            value={dados.parcelado}
            onChange={(e) => setDados((p) => ({ ...p, parcelado: e.target.value }))}
            placeholder="Ex: em até 6x de R$ 29,98 sem juros"
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500 transition shadow-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <Tag className="w-3.5 h-3.5 text-purple-500" />
            Cupom de Desconto:
          </label>
          <input
            type="text"
            value={dados.cupom}
            onChange={(e) => setDados((p) => ({ ...p, cupom: e.target.value }))}
            placeholder="Ex: SHOPEE20 ou FCS10"
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 uppercase font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500 transition shadow-sm"
          />
        </div>
      </div>

      {/* 6. AVALIAÇÃO E QUANTIDADE DE AVALIAÇÕES (Requisito Explícito do Usuário!) */}
      <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Avaliação dos Clientes & Quantidade de Pessoas
          </span>
          <span className="text-[10px] bg-amber-200/80 text-amber-950 font-bold px-2 py-0.5 rounded-full">
            Renderiza no Banner & Legenda
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              Nota da Avaliação (Estrelas):
            </label>
            <input
              type="text"
              value={dados.avaliacao}
              onChange={(e) => setDados((p) => ({ ...p, avaliacao: e.target.value }))}
              placeholder="Ex: 4.8"
              className="w-full text-xs sm:text-sm bg-white border border-amber-300 rounded-xl px-3 py-2.5 text-slate-800 font-bold focus:outline-none focus:border-amber-500 shadow-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              Quantidade de Pessoas que Avaliaram:
            </label>
            <input
              type="text"
              value={dados.avaliacoesQtd}
              onChange={(e) => setDados((p) => ({ ...p, avaliacoesQtd: e.target.value }))}
              placeholder="Ex: 1.450 ou 2.3k"
              className="w-full text-xs sm:text-sm bg-white border border-amber-300 rounded-xl px-3 py-2.5 text-slate-800 font-bold focus:outline-none focus:border-amber-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 7. FRETE E WHATSAPP FCS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <Truck className="w-3.5 h-3.5 text-slate-400" />
            Condição de Frete:
          </label>
          <select
            value={dados.frete}
            onChange={(e) => setDados((p) => ({ ...p, frete: e.target.value }))}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500 transition shadow-sm"
          >
            <option value="Frete Grátis com cupom">🔥 Frete Grátis com cupom (Shopee)</option>
            <option value="Frete Grátis">🚚 Frete Grátis</option>
            <option value="Consulte o CEP">🔍 Consulte o CEP</option>
            <option value="Retirada no local">🏢 Retirada no local</option>
            <option value="Entrega expressa">⚡ Entrega expressa</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-500" />
            WhatsApp no Rodapé do Banner:
          </label>
          <input
            type="text"
            value={dados.whatsapp}
            onChange={(e) => setDados((p) => ({ ...p, whatsapp: e.target.value }))}
            placeholder="(71) 98818-5775"
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-orange-500 transition shadow-sm"
          />
        </div>
      </div>

      {/* 8. FOTO DO PRODUTO (AUTOMÁTICA OU UPLOAD MANUAL) */}
      <div className="pt-2">
        <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
            Imagem do Produto:
          </span>
          {dados.imagemLocal || dados.imagemUrl ? (
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              ✓ Imagem carregada
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">Puxa via link ou upload</span>
          )}
        </label>

        <div className="flex items-center gap-3">
          {/* Thumbnail Preview */}
          <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
            {dados.imagemLocal || dados.imagemUrl ? (
              <img
                src={dados.imagemLocal || dados.imagemUrl}
                alt="Thumbnail"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-slate-300" />
            )}
          </div>

          <div className="flex-1 space-y-1.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadArquivo}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition border border-slate-200 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              {dados.imagemLocal ? 'Substituir Imagem do Arquivo' : 'Upload Manual da Imagem'}
            </button>
            <p className="text-[10px] text-slate-400">
              Dica: O upload manual evita qualquer bloqueio de CORS ao baixar o banner em PNG.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
