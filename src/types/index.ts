export type LojaTipo = 'shopee' | 'mercadolivre' | 'kabum';

export interface ProdutoData {
  loja: LojaTipo;
  url: string;
  descricao: string;
  precoOriginal: string;
  precoVista: string;
  parcelado: string;
  cupom: string;
  avaliacao: string;
  avaliacoesQtd: string;
  frete: string;
  whatsapp: string;
  imagemUrl: string;
  imagemLocal?: string;
  imagemFile?: File | null;
}

export interface TemaLoja {
  nome: string;
  fundoBanner: string;
  fundoHeaderLogo: string;
  textoLogoAzul: string;
  tituloTexto: string;
  precoPorTexto: string;
  precoDeTexto: string;
  estrelaCor: string;
  badgeCor: string;
  badgeTexto: string;
  accent: string;
}

export interface ApiResposta {
  loja?: string;
  titulo?: string;
  precoOriginal?: string;
  precoVista?: string;
  precoDe?: string;
  precoPor?: string;
  parcelamento?: string;
  imagem?: string;
  imagemUrl?: string;
  avaliacao?: string;
  avaliacoesQtd?: string;
  quantidadeAvaliacoes?: string;
  cupom?: string;
  frete?: string;
  error?: string;
  details?: string;
}
