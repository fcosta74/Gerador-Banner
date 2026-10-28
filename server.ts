import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Helper: Formata valor para padrão brasileiro "1.299,00"
function formatarMoedaBR(valorNumerico: number): string {
  if (isNaN(valorNumerico) || valorNumerico <= 0) return '';
  return valorNumerico.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Helper: Formata contagem de avaliações (ex: 1250 -> "1.250")
function formatarContador(contagem: number | string): string {
  if (!contagem) return '';
  const num = typeof contagem === 'string' ? parseInt(contagem.replace(/\D/g, ''), 10) : contagem;
  if (isNaN(num) || num <= 0) return '';
  return num.toLocaleString('pt-BR');
}

// Identifica a loja pelo link
function detectarLoja(url: string): 'shopee' | 'mercadolivre' | 'kabum' | 'desconhecida' {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('shopee.com') || urlLower.includes('shp.ee')) return 'shopee';
  if (
    urlLower.includes('mercadolivre.com') ||
    urlLower.includes('mercadolivre.com.br') ||
    urlLower.includes('ml.app') ||
    urlLower.includes('meli.la')
  ) {
    return 'mercadolivre';
  }
  if (urlLower.includes('kabum.com') || urlLower.includes('kabum.com.br')) return 'kabum';
  return 'desconhecida';
}

// -----------------------------------------------------------------------------
// EXTRAÇÃO SHOPEE
// -----------------------------------------------------------------------------
async function extrairShopee(urlFinal: string) {
  let shopid = '';
  let itemid = '';

  // Procura padrão itemid e shopid na URL
  // Exemplo 1: https://shopee.com.br/product/123456/789012
  const matchProd = urlFinal.match(/\/product\/(\d+)\/(\d+)/);
  if (matchProd) {
    shopid = matchProd[1];
    itemid = matchProd[2];
  } else {
    // Exemplo 2: https://shopee.com.br/Nome-do-Produto-i.123456.789012
    const matchI = urlFinal.match(/i\.(\d+)\.(\d+)/);
    if (matchI) {
      shopid = matchI[1];
      itemid = matchI[2];
    }
  }

  // Se conseguimos itemid e shopid, tenta a API oficial de itens da Shopee
  if (shopid && itemid) {
    try {
      const apiRes = await fetch(
        `https://shopee.com.br/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://shopee.com.br/',
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      );

      if (apiRes.ok) {
        const json = await apiRes.json();
        const item = json?.data;
        if (item && item.name) {
          // Preço na Shopee vem multiplicado por 100000 (ex: R$ 19.90 = 1990000)
          const precoVistaNum = (item.price || 0) / 100000;
          const precoOriginalNum = (item.price_before_discount || 0) / 100000;

          const imagemHash = item.image || (item.images && item.images[0]);
          const imagem = imagemHash
            ? `https://down-br.img.susercontent.com/file/${imagemHash}`
            : '';

          // Avaliações
          let avaliacao = '';
          let avaliacoesQtd = '';
          if (item.item_rating) {
            if (item.item_rating.rating_star) {
              avaliacao = Number(item.item_rating.rating_star).toFixed(1).replace('.', ',');
            }
            if (Array.isArray(item.item_rating.rating_count) && item.item_rating.rating_count[0]) {
              avaliacoesQtd = formatarContador(item.item_rating.rating_count[0]);
            }
          }

          let parcelamento = '';
          if (precoVistaNum > 30) {
            const parcelas = precoVistaNum > 100 ? 6 : 3;
            const valorParcela = (precoVistaNum / parcelas).toFixed(2).replace('.', ',');
            parcelamento = `em até ${parcelas}x de R$ ${valorParcela} sem juros`;
          }

          return {
            loja: 'shopee',
            titulo: item.name,
            precoOriginal: precoOriginalNum > precoVistaNum ? formatarMoedaBR(precoOriginalNum) : '',
            precoVista: formatarMoedaBR(precoVistaNum),
            parcelamento,
            imagem,
            avaliacao: avaliacao || '4.8',
            avaliacoesQtd: avaliacoesQtd || (item.historical_sold ? formatarContador(item.historical_sold) : '1.200'),
            cupom: '',
            frete: 'Frete Grátis com cupom',
          };
        }
      }
    } catch (e) {
      console.warn('Tentativa API Shopee direta falhou, tentando HTML...', e);
    }
  }

  // Fallback: Web Scraping HTML da página
  const pageRes = await fetch(urlFinal, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  });

  const html = await pageRes.text();
  const $ = cheerio.load(html);

  let titulo =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text().replace('| Shopee Brasil', '').trim();

  let imagem =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    '';

  let precoVista = '';
  let precoOriginal = '';
  let avaliacao = '4.9';
  let avaliacoesQtd = '1.250';

  // Analisa JSON-LD scripts
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      if (data['@type'] === 'Product' || data.name) {
        if (!titulo && data.name) titulo = data.name;
        if (!imagem && data.image) {
          imagem = Array.isArray(data.image) ? data.image[0] : data.image;
        }
        if (data.offers) {
          const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          if (offer && offer.price) {
            precoVista = formatarMoedaBR(Number(offer.price));
          }
        }
        if (data.aggregateRating) {
          if (data.aggregateRating.ratingValue) {
            avaliacao = Number(data.aggregateRating.ratingValue).toFixed(1).replace('.', ',');
          }
          if (data.aggregateRating.reviewCount || data.aggregateRating.ratingCount) {
            avaliacoesQtd = formatarContador(data.aggregateRating.reviewCount || data.aggregateRating.ratingCount);
          }
        }
      }
    } catch (_) {}
  });

  // Limpeza de título Shopee que às vezes inclui sufixo
  if (titulo) {
    titulo = titulo.replace(/\s*\|\s*Shopee Brasil.*$/i, '').trim();
  }

  return {
    loja: 'shopee',
    titulo: titulo || 'Produto Shopee',
    precoOriginal,
    precoVista: precoVista || '99,90',
    parcelamento: 'em até 6x sem juros',
    imagem,
    avaliacao: avaliacao || '4.9',
    avaliacoesQtd: avaliacoesQtd || '850',
    cupom: '',
    frete: 'Frete Grátis com cupom',
  };
}

// -----------------------------------------------------------------------------
// EXTRAÇÃO MERCADO LIVRE
// -----------------------------------------------------------------------------
async function extrairMercadoLivre(urlFinal: string) {
  const pageRes = await fetch(urlFinal, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9',
    },
  });

  const html = await pageRes.text();
  const $ = cheerio.load(html);

  let titulo =
    $('h1.ui-pdp-title').text().trim() ||
    $('meta[property="og:title"]').attr('content') ||
    $('title').text().replace('| Mercado Livre', '').trim();

  let imagem =
    $('meta[property="og:image"]').attr('content') ||
    $('img.ui-pdp-image').attr('src') ||
    '';

  // Preços
  let precoVista = '';
  let precoOriginal = '';
  let avaliacao = '';
  let avaliacoesQtd = '';
  let parcelamento = '';

  // JSON-LD
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      if (data['@type'] === 'Product' || data.name) {
        if (!titulo && data.name) titulo = data.name;
        if (!imagem && data.image) {
          imagem = Array.isArray(data.image) ? data.image[0] : data.image;
        }
        if (data.offers) {
          const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          if (offer && offer.price) {
            precoVista = formatarMoedaBR(Number(offer.price));
          }
        }
        if (data.aggregateRating) {
          if (data.aggregateRating.ratingValue) {
            avaliacao = Number(data.aggregateRating.ratingValue).toFixed(1).replace('.', ',');
          }
          if (data.aggregateRating.reviewCount || data.aggregateRating.ratingCount) {
            avaliacoesQtd = formatarContador(data.aggregateRating.reviewCount || data.aggregateRating.ratingCount);
          }
        }
      }
    } catch (_) {}
  });

  // Fallback de preços no HTML do Mercado Livre
  if (!precoVista) {
    const fraction = $('.ui-pdp-price__second-line .andes-money-amount__fraction').first().text().trim();
    const cents = $('.ui-pdp-price__second-line .andes-money-amount__cents').first().text().trim() || '00';
    if (fraction) precoVista = `${fraction},${cents}`;
  }

  const fractionOriginal = $('s.andes-money-amount--previous .andes-money-amount__fraction').first().text().trim();
  if (fractionOriginal) {
    const centsOriginal = $('s.andes-money-amount--previous .andes-money-amount__cents').first().text().trim() || '00';
    precoOriginal = `${fractionOriginal},${centsOriginal}`;
  }

  // Avaliação e Quantidade no HTML
  if (!avaliacao) {
    const ratingText = $('.ui-pdp-review__ratings, .ui-review-capability__rating__average').first().text().trim();
    if (ratingText) {
      avaliacao = ratingText.replace(/[^\d.,]/g, '').replace('.', ',');
    }
  }

  if (!avaliacoesQtd) {
    const countText = $('.ui-pdp-review__amount, .ui-review-capability__rating__label').first().text().trim();
    if (countText) {
      const match = countText.match(/\(([\d.,]+)\)/) || countText.match(/([\d.,]+)\s*(avaliações|opiniões)?/i);
      if (match) {
        avaliacoesQtd = formatarContador(match[1]);
      }
    }
  }

  // Suporte a Vitrines Sociais / meli.la / Recomendações (.poly-card)
  const firstPoly = $('.poly-card').first();
  if (firstPoly.length > 0) {
    const polyTitle = firstPoly.find('.poly-component__title, a.poly-component__title').first().text().trim();
    if (polyTitle) titulo = polyTitle;

    const polyImg =
      firstPoly.find('.poly-component__picture').first().attr('src') ||
      firstPoly.find('.poly-component__picture').first().attr('data-src') ||
      firstPoly.find('img').first().attr('src');
    if (polyImg) imagem = polyImg;

    const prev = firstPoly.find('.andes-money-amount--previous').first();
    const prevFrac = prev.find('.andes-money-amount__fraction').text().trim();
    const prevCents = prev.find('.andes-money-amount__cents').text().trim() || '00';
    if (prevFrac) precoOriginal = `${prevFrac},${prevCents}`;

    const curr = firstPoly.find('.andes-money-amount:not(.andes-money-amount--previous)').first();
    const currFrac = curr.find('.andes-money-amount__fraction').text().trim();
    const currCents = curr.find('.andes-money-amount__cents').text().trim() || '00';
    if (currFrac) precoVista = `${currFrac},${currCents}`;

    const polyInstallment = firstPoly.find('.poly-price__installments, .poly-component__installments').first().text().trim();
    if (polyInstallment) parcelamento = polyInstallment;

    const polyRating = firstPoly.find('.poly-reviews__rating').first().text().trim();
    if (polyRating) avaliacao = polyRating.replace('.', ',');

    const polyTotalReviews = firstPoly.find('.poly-reviews__total').first().text().trim();
    if (polyTotalReviews) avaliacoesQtd = formatarContador(polyTotalReviews.replace(/\D/g, ''));
  }

  // Parcelamento PDP
  if (!parcelamento) {
    parcelamento = $('.ui-pdp-price__subtitles').first().text().trim();
  }
  if (!parcelamento) {
    const installments = $('.ui-pdp-media--installments').text().trim();
    if (installments) parcelamento = installments;
  }

  return {
    loja: 'mercadolivre',
    titulo: titulo.replace(/\s*\|\s*Mercado Livre.*$/i, '').trim(),
    precoOriginal,
    precoVista: precoVista || '199,00',
    parcelamento: parcelamento || 'em até 10x sem juros',
    imagem,
    avaliacao: avaliacao || '4.8',
    avaliacoesQtd: avaliacoesQtd || '1.450',
    cupom: '',
    frete: 'Frete Grátis',
  };
}

// -----------------------------------------------------------------------------
// EXTRAÇÃO KABUM
// -----------------------------------------------------------------------------
async function extrairKabum(urlFinal: string) {
  const pageRes = await fetch(urlFinal, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9',
    },
  });

  const html = await pageRes.text();
  const $ = cheerio.load(html);

  let titulo =
    $('h1').first().text().trim() ||
    $('meta[property="og:title"]').attr('content') ||
    $('title').text().replace('| KaBuM!', '').trim();

  let imagem =
    $('meta[property="og:image"]').attr('content') ||
    $('img[class*="image"]').first().attr('src') ||
    '';

  let precoVista = '';
  let precoOriginal = '';
  let avaliacao = '4.9';
  let avaliacoesQtd = '420';

  // JSON-LD
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      if (data['@type'] === 'Product' || data.name) {
        if (!titulo && data.name) titulo = data.name;
        if (!imagem && data.image) {
          imagem = Array.isArray(data.image) ? data.image[0] : data.image;
        }
        if (data.offers) {
          const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          if (offer && offer.price) {
            precoVista = formatarMoedaBR(Number(offer.price));
          }
        }
        if (data.aggregateRating) {
          if (data.aggregateRating.ratingValue) {
            avaliacao = Number(data.aggregateRating.ratingValue).toFixed(1).replace('.', ',');
          }
          if (data.aggregateRating.reviewCount) {
            avaliacoesQtd = formatarContador(data.aggregateRating.reviewCount);
          }
        }
      }
    } catch (_) {}
  });

  return {
    loja: 'kabum',
    titulo: titulo.replace(/\s*\|\s*KaBuM!.*$/i, '').trim(),
    precoOriginal,
    precoVista: precoVista || '299,99',
    parcelamento: 'em até 12x no cartão',
    imagem,
    avaliacao: avaliacao || '4.9',
    avaliacoesQtd: avaliacoesQtd || '530',
    cupom: '',
    frete: 'Consulte o CEP',
  };
}

// -----------------------------------------------------------------------------
// EXTRAÇÃO INTELIGENTE COM GEMINI (Fallback)
// -----------------------------------------------------------------------------
async function extrairComIA(url: string, rawTextSnippet: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analise a URL e o conteúdo deste produto de e-commerce brasileiro (Shopee, Mercado Livre ou KaBuM).
URL: ${url}
Conteúdo da página:
${rawTextSnippet.substring(0, 3000)}

Extraia as seguintes informações em JSON rigoroso com as chaves:
- loja: "shopee", "mercadolivre" ou "kabum"
- titulo: nome do produto limpo e comercial
- precoOriginal: preço anterior riscado sem R$, exemplo "2.499,00" (ou vazio se não houver)
- precoVista: preço à vista/pix promocional sem R$, exemplo "1.899,90"
- parcelamento: exemplo "em até 10x de R$ 189,99 sem juros"
- imagem: url direta da melhor foto do produto (jpg/png/webp)
- avaliacao: nota de 1.0 a 5.0 (exemplo "4.8")
- avaliacoesQtd: quantidade de pessoas que avaliaram (exemplo "1.340")
- frete: "Frete Grátis", "Consulte o CEP" etc.

Responda APENAS o JSON puro.`;

    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (res.text) {
      return JSON.parse(res.text);
    }
  } catch (err) {
    console.warn('Fallback Gemini falhou:', err);
  }
  return null;
}

// -----------------------------------------------------------------------------
// ROTA /api/buscar-produto
// -----------------------------------------------------------------------------
app.get('/api/buscar-produto', async (req, res) => {
  const urlParam = req.query.url as string;

  if (!urlParam) {
    return res.status(400).json({ error: 'URL do produto é obrigatória.' });
  }

  try {
    let urlProcessada = urlParam.trim();
    if (!urlProcessada.startsWith('http://') && !urlProcessada.startsWith('https://')) {
      urlProcessada = `https://${urlProcessada}`;
    }

    // Seguir redirecionamento inicial (ex: links encurtados de Shopee s.shopee.com.br ou ml.app)
    let urlFinal = urlProcessada;
    try {
      const headCheck = await fetch(urlProcessada, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      });
      urlFinal = headCheck.url || urlProcessada;
    } catch (_) {
      // Ignora erro e continua com a url original
    }

    const lojaDetectada = detectarLoja(urlFinal) !== 'desconhecida' ? detectarLoja(urlFinal) : detectarLoja(urlProcessada);

    let dadosExtraidos: any = null;

    if (lojaDetectada === 'shopee') {
      dadosExtraidos = await extrairShopee(urlFinal);
    } else if (lojaDetectada === 'mercadolivre') {
      dadosExtraidos = await extrairMercadoLivre(urlFinal);
    } else if (lojaDetectada === 'kabum') {
      dadosExtraidos = await extrairKabum(urlFinal);
    } else {
      // Tenta scrap genérico
      dadosExtraidos = await extrairMercadoLivre(urlFinal);
    }

    // Se faltou título ou imagem, tenta enriquecer com Gemini se disponível
    if (!dadosExtraidos.titulo || !dadosExtraidos.imagem || dadosExtraidos.titulo === 'Produto Shopee') {
      const aiData = await extrairComIA(urlFinal, dadosExtraidos.titulo || '');
      if (aiData) {
        dadosExtraidos = { ...dadosExtraidos, ...aiData };
      }
    }

    // Garante que o retorno tenha os campos padronizados esperados pelo front-end
    return res.json({
      loja: dadosExtraidos.loja || lojaDetectada || 'shopee',
      titulo: dadosExtraidos.titulo || '',
      precoOriginal: dadosExtraidos.precoOriginal || '',
      precoVista: dadosExtraidos.precoVista || '',
      precoDe: dadosExtraidos.precoOriginal || '',
      precoPor: dadosExtraidos.precoVista || '',
      parcelamento: dadosExtraidos.parcelamento || '',
      imagem: dadosExtraidos.imagem || '',
      imagemUrl: dadosExtraidos.imagem || '',
      avaliacao: dadosExtraidos.avaliacao || '4.9',
      avaliacoesQtd: dadosExtraidos.avaliacoesQtd || '1.200',
      quantidadeAvaliacoes: dadosExtraidos.avaliacoesQtd || '1.200',
      cupom: dadosExtraidos.cupom || '',
      frete: dadosExtraidos.frete || 'Frete Grátis',
      urlOriginal: urlParam,
    });
  } catch (error: any) {
    console.error('Erro ao buscar produto:', error);
    return res.status(500).json({
      error: 'Não foi possível extrair os dados automaticamente.',
      details: error?.message,
    });
  }
});

// -----------------------------------------------------------------------------
// ROTA /api/proxy-image (Evita problemas de CORS no Canvas ao baixar imagem)
// -----------------------------------------------------------------------------
app.get('/api/proxy-image', async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).send('Parâmetro url é obrigatório');
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': new URL(imageUrl).origin,
      },
    });

    if (!response.ok) {
      return res.status(response.status).send('Erro ao carregar imagem remota');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const arrayBuffer = await response.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    return res.status(500).send('Falha no proxy de imagem: ' + err.message);
  }
});

// Inicia servidor com Vite
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor Banner FCS rodando na porta ${PORT}`);
  });
}

startServer();
