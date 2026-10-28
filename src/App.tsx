import React, { useState } from 'react';
import { LojaTipo, ProdutoData, ApiResposta } from './types';
import { Header } from './components/Header';
import { FormInputs } from './components/FormInputs';
import { BannerPreview } from './components/BannerPreview';
import { CaptionBox } from './components/CaptionBox';
import { ApiTechnicalModal } from './components/ApiTechnicalModal';
import { InstallAppModal } from './components/InstallAppModal';

const DADOS_INICIAIS: ProdutoData = {
  loja: 'shopee',
  url: 'https://shopee.com.br/product/382910/982143',
  descricao: 'Fone de Ouvido Bluetooth 5.3 Sem Fio com Cancelamento de Ruído e Bateria de Longa Duração',
  precoOriginal: '249,90',
  precoVista: '139,90',
  parcelado: 'em até 6x de R$ 23,31 sem juros',
  cupom: 'SHOPEE20',
  avaliacao: '4.9',
  avaliacoesQtd: '1.450',
  frete: 'Frete Grátis com cupom',
  whatsapp: '(71) 98818-5775',
  imagemUrl: '',
  imagemLocal: '',
};

export default function App() {
  const [dados, setDados] = useState<ProdutoData>(DADOS_INICIAIS);
  const [apiUrl, setApiUrl] = useState<string>('/api/buscar-produto');
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erroBusca, setErroBusca] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  // Busca dados na API (seja a interna ou a do Vercel)
  const buscarDados = async () => {
    const urlBusca = dados.url?.trim();
    if (!urlBusca) {
      setErroBusca('Por favor, insira uma URL de produto da Shopee, Mercado Livre ou KaBuM!.');
      return;
    }

    setCarregando(true);
    setErroBusca(null);

    try {
      const endpoint = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}url=${encodeURIComponent(urlBusca)}`;
      const res = await fetch(endpoint);

      if (!res.ok) {
        throw new Error(`Erro na API (${res.status}): Não foi possível extrair dados desta URL.`);
      }

      const data: ApiResposta = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Detecta loja retornada ou preserva a selecionada
      let lojaDetectada: LojaTipo = dados.loja;
      if (data.loja === 'shopee' || data.loja === 'mercadolivre' || data.loja === 'kabum') {
        lojaDetectada = data.loja as LojaTipo;
      }

      const valPrecoDe = data.precoOriginal || data.precoDe || '';
      const valPrecoPor = data.precoVista || data.precoPor || '';
      const valAvaliacao = data.avaliacao || '4.8';
      const valAvaliacoesQtd = data.avaliacoesQtd || data.quantidadeAvaliacoes || '';
      const valImagem = data.imagem || data.imagemUrl || '';

      setDados((prev) => ({
        ...prev,
        loja: lojaDetectada,
        descricao: data.titulo || prev.descricao,
        precoOriginal: valPrecoDe || prev.precoOriginal,
        precoVista: valPrecoPor || prev.precoVista,
        parcelado: data.parcelamento || prev.parcelado,
        cupom: data.cupom || prev.cupom,
        avaliacao: valAvaliacao,
        avaliacoesQtd: valAvaliacoesQtd || prev.avaliacoesQtd,
        frete: data.frete || prev.frete,
        imagemUrl: valImagem,
        imagemLocal: '', // reseta imagem manual para priorizar a nova imagem buscada
      }));
    } catch (err: any) {
      console.error('Erro na extração do produto:', err);
      setErroBusca(
        err.message ||
          'Não foi possível extrair os dados automaticamente. Verifique se o link está acessível ou preencha manualmente.'
      );
    } finally {
      setCarregando(false);
    }
  };

  // Limpa todos os dados
  const limparDados = () => {
    setDados({
      loja: 'shopee',
      url: '',
      descricao: '',
      precoOriginal: '',
      precoVista: '',
      parcelado: '',
      cupom: '',
      avaliacao: '',
      avaliacoesQtd: '',
      frete: 'Frete Grátis com cupom',
      whatsapp: '(71) 98818-5775',
      imagemUrl: '',
      imagemLocal: '',
      imagemFile: null,
    });
    setErroBusca(null);
  };

  // Carrega produtos de demonstração para testar o banner instantaneamente
  const carregarExemplo = (tipoLoja: LojaTipo) => {
    setErroBusca(null);
    if (tipoLoja === 'shopee') {
      setDados({
        loja: 'shopee',
        url: 'https://shopee.com.br/product/91827364/18273645',
        descricao: 'Smartwatch Relógio Inteligente Pro À Prova D\'Água Monitor Cardíaco e Notificações',
        precoOriginal: '289,90',
        precoVista: '159,90',
        parcelado: 'em até 6x de R$ 26,65 sem juros',
        cupom: 'SHOPEE15',
        avaliacao: '4.9',
        avaliacoesQtd: '2.140',
        frete: 'Frete Grátis com cupom',
        whatsapp: '(71) 98818-5775',
        imagemUrl: '',
        imagemLocal: '',
      });
    } else if (tipoLoja === 'mercadolivre') {
      setDados({
        loja: 'mercadolivre',
        url: 'https://produto.mercadolivre.com.br/MLB-4581928374-kit-ferramentas-profissional',
        descricao: 'Kit Parafusadeira e Furadeira de Impacto 12V com 2 Baterias e Maleta de Acessórios',
        precoOriginal: '399,00',
        precoVista: '279,90',
        parcelado: 'em até 10x de R$ 27,99 sem juros',
        cupom: 'PREFERIDO',
        avaliacao: '4.8',
        avaliacoesQtd: '1.820',
        frete: 'Frete Grátis',
        whatsapp: '(71) 98818-5775',
        imagemUrl: '',
        imagemLocal: '',
      });
    } else {
      setDados({
        loja: 'kabum',
        url: 'https://www.kabum.com.br/produto/384729/teclado-mecanico-gamer-rgb',
        descricao: 'Teclado Mecânico Gamer RGB Switch Blue Anti-Ghosting ABNT2 Cabo Trançado',
        precoOriginal: '349,90',
        precoVista: '219,90',
        parcelado: 'em até 12x no cartão',
        cupom: 'GAMERFCS',
        avaliacao: '4.9',
        avaliacoesQtd: '640',
        frete: 'Consulte o CEP',
        whatsapp: '(71) 98818-5775',
        imagemUrl: '',
        imagemLocal: '',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Cabeçalho */}
      <Header
        onOpenApiModal={() => setIsModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna da Esquerda: Formulário de Dados e Legenda (7 Colunas) */}
          <div className="lg:col-span-7 space-y-6">
            <FormInputs
              dados={dados}
              setDados={setDados}
              onBuscar={buscarDados}
              onLimpar={limparDados}
              carregando={carregando}
              erroBusca={erroBusca}
              onCarregarExemplo={carregarExemplo}
            />

            {/* Caixa da Legenda Formatada */}
            <CaptionBox dados={dados} />
          </div>

          {/* Coluna da Direita: Preview do Canvas (5 Colunas) */}
          <div className="lg:col-span-5">
            <BannerPreview dados={dados} isDesenhando={carregando} />
          </div>
        </div>
      </main>

      {/* Modal Técnico com os códigos e instruções da API Vercel */}
      <ApiTechnicalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apiUrl={apiUrl}
        setApiUrl={setApiUrl}
      />

      {/* Modal Guia de Instalação para Windows & Android */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
