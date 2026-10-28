import React, { useState } from 'react';
import { X, Code2, Copy, Check, Server, ExternalLink, HelpCircle, ArrowRight } from 'lucide-react';
import { VERCEL_CODE_SNIPPET, VERCEL_PACKAGE_JSON } from '../data/vercelApiGuide';

interface ApiTechnicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  setApiUrl: (url: string) => void;
}

export const ApiTechnicalModal: React.FC<ApiTechnicalModalProps> = ({
  isOpen,
  onClose,
  apiUrl,
  setApiUrl,
}) => {
  const [tabAtiva, setTabAtiva] = useState<'codigo' | 'shopee' | 'instalacao' | 'configuracao'>('codigo');
  const [copiadoCodigo, setCopiadoCodigo] = useState(false);
  const [copiadoPackage, setCopiadoPackage] = useState(false);

  if (!isOpen) return null;

  const copiar = (texto: string, tipo: 'codigo' | 'package') => {
    navigator.clipboard.writeText(texto).then(() => {
      if (tipo === 'codigo') {
        setCopiadoCodigo(true);
        setTimeout(() => setCopiadoCodigo(false), 2000);
      } else {
        setCopiadoPackage(true);
        setTimeout(() => setCopiadoPackage(false), 2000);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Detalhes Técnicos & Integração da API Shopee</h2>
              <p className="text-xs text-slate-400">
                Código pronto para atualizar sua API no Vercel (<code className="text-orange-300">https://banner-geral.vercel.app/api/buscar-produto</code>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 text-sm">
          <button
            onClick={() => setTabAtiva('codigo')}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
              tabAtiva === 'codigo'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" /> Código da API (api/buscar-produto.js)
          </button>
          <button
            onClick={() => setTabAtiva('shopee')}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
              tabAtiva === 'shopee'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Como a Shopee Funciona
          </button>
          <button
            onClick={() => setTabAtiva('instalacao')}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
              tabAtiva === 'instalacao'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" /> Passo a Passo no Vercel
          </button>
          <button
            onClick={() => setTabAtiva('configuracao')}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center gap-2 ${
              tabAtiva === 'configuracao'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ExternalLink className="w-4 h-4" /> Seleção de Endpoint
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-700 space-y-4">
          {tabAtiva === 'codigo' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    Arquivo: <code className="bg-slate-100 px-2 py-0.5 rounded text-orange-600">api/buscar-produto.js</code>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Substitua o conteúdo do seu endpoint no Vercel com este código para suportar Shopee + Mercado Livre + KaBuM!
                  </p>
                </div>
                <button
                  onClick={() => copiar(VERCEL_CODE_SNIPPET, 'codigo')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition"
                >
                  {copiadoCodigo ? (
                    <>
                      <Check className="w-4 h-4" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copiar Código Completo
                    </>
                  )}
                </button>
              </div>

              <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[420px] leading-relaxed">
                  {VERCEL_CODE_SNIPPET}
                </pre>
              </div>
            </div>
          )}

          {tabAtiva === 'shopee' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-orange-950">
                <h4 className="font-bold text-base mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                  Mapeamento Técnico da Shopee
                </h4>
                <p className="text-xs leading-relaxed">
                  A Shopee possui uma arquitetura com particularidades específicas que foram resolvidas nesta atualização:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-xs">1</span>
                    Resolução de Links Curtos (s.shopee.com.br / shp.ee)
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Afiliados e usuários frequentemente usam links curtos (<code className="text-orange-600">s.shopee.com.br/XYZ</code>). A API executa um <code className="text-slate-800 font-semibold">fetch(url, &#123; redirect: 'follow' &#125;)</code> para obter a URL de destino com os IDs reais do produto.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-xs">2</span>
                    Identificadores <code className="text-orange-600">shopid</code> e <code className="text-orange-600">itemid</code>
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Toda página da Shopee termina em <code className="font-mono text-slate-800">i.[shopid].[itemid]</code> ou <code className="font-mono text-slate-800">/product/[shopid]/[itemid]</code>. O regex captura esses dois parâmetros para consultar a API interna de alta performance.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-xs">3</span>
                    Preços na Shopee: Divisão por 100.000
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    O JSON retornado pela Shopee armazena preços em unidades com 5 casas decimais (ex: R$ 49,90 vem como <code className="font-mono text-slate-800">4990000</code>). A função divide automaticamente por 100.000 e formata para Real brasileiro.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-xs">4</span>
                    Avaliação & Quantidade de Avaliações
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    O campo <code className="font-mono text-slate-800">item_rating.rating_star</code> fornece a média (ex: 4.88 &rarr; "4.9") e <code className="font-mono text-slate-800">item_rating.rating_count[0]</code> fornece a contagem exata de pessoas que avaliaram (ex: 1.450), além de <code className="font-mono text-slate-800">historical_sold</code> (quantidade vendida).
                  </p>
                </div>
              </div>
            </div>
          )}

          {tabAtiva === 'instalacao' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base">Como atualizar seu projeto no Vercel:</h4>

              <div className="space-y-3">
                <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                  <div>
                    <strong className="text-slate-900 block text-xs sm:text-sm">Abra o repositório do seu backend Vercel</strong>
                    <p className="text-xs text-slate-500 mt-0.5">Localize a pasta <code className="text-orange-600 font-mono">api/</code> ou <code className="text-orange-600 font-mono">pages/api/</code>.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                  <div className="w-full">
                    <strong className="text-slate-900 block text-xs sm:text-sm">Instale o pacote cheerio</strong>
                    <p className="text-xs text-slate-500 mt-0.5 mb-2">No terminal do seu projeto Vercel, execute:</p>
                    <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-xs flex items-center justify-between">
                      <code>npm install cheerio</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('npm install cheerio');
                          alert('Comando copiado!');
                        }}
                        className="text-orange-400 hover:text-orange-300 text-[11px] font-sans font-semibold"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                  <div>
                    <strong className="text-slate-900 block text-xs sm:text-sm">Cole o código do arquivo</strong>
                    <p className="text-xs text-slate-500 mt-0.5">Substitua o arquivo <code className="text-orange-600 font-mono">api/buscar-produto.js</code> com o código da aba anterior.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</span>
                  <div>
                    <strong className="text-slate-900 block text-xs sm:text-sm">Faça o Deploy para o Vercel</strong>
                    <p className="text-xs text-slate-500 mt-0.5">Faça <code className="font-mono text-slate-700">git push</code> para o GitHub ou rode <code className="font-mono text-slate-700">vercel --prod</code> no terminal. Sua API atualizará instantaneamente.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tabAtiva === 'configuracao' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base">Configuração de Endpoint da API</h4>
              <p className="text-xs text-slate-500">
                Você pode escolher se este aplicativo deve consultar o backend integrado (local neste app) ou sua API externa no Vercel.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  URL da API de Busca de Produtos:
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-orange-500"
                  placeholder="Ex: /api/buscar-produto ou https://banner-geral.vercel.app/api/buscar-produto"
                />

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setApiUrl('/api/buscar-produto')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center gap-1"
                  >
                    Usar API Integrada (/api/buscar-produto)
                  </button>
                  <button
                    type="button"
                    onClick={() => setApiUrl('https://banner-geral.vercel.app/api/buscar-produto')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center gap-1"
                  >
                    Usar sua API Vercel (banner-geral.vercel.app)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Compatível com Shopee, Mercado Livre e KaBuM!
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
