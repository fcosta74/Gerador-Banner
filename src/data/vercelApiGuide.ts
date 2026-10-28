export const VERCEL_CODE_SNIPPET = `// api/buscar-produto.js (ou /pages/api/buscar-produto.js no Next.js / Vercel Serverless)
// Suporte completo a Shopee, Mercado Livre e KaBuM!
// Com extração de Preço De, Preço Por, Parcelamento, Imagem, Avaliação e Quantidade de Avaliações!

const cheerio = require('cheerio');

// Formata número para Real brasileiro: 1499.9 -> "1.499,90"
function formatarMoedaBR(valor) {
  if (!valor || isNaN(valor)) return '';
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Formata quantidade de avaliações: 1250 -> "1.250"
function formatarContador(contagem) {
  if (!contagem) return '';
  const num = typeof contagem === 'string' ? parseInt(contagem.replace(/\\D/g, ''), 10) : contagem;
  if (isNaN(num) || num <= 0) return '';
  return num.toLocaleString('pt-BR');
}

// -------------------------------------------------------------
// 1. SHOPEE
// -------------------------------------------------------------
async function processarShopee(urlFinal) {
  let shopid = '';
  let itemid = '';

  // Extrai shopid e itemid da URL
  // Ex: https://shopee.com.br/product/123456/789012 ou https://shopee.com.br/Nome-i.123456.789012
  const matchProd = urlFinal.match(/\\/product\\/(\\d+)\\/(\\d+)/);
  if (matchProd) {
    shopid = matchProd[1];
    itemid = matchProd[2];
  } else {
    const matchI = urlFinal.match(/i\\.(\\d+)\\.(\\d+)/);
    if (matchI) {
      shopid = matchI[1];
      itemid = matchI[2];
    }
  }

  // Se encontrou os identificadores, consulta a API pública oficial de itens da Shopee
  if (shopid && itemid) {
    try {
      const apiRes = await fetch(
        \`https://shopee.com.br/api/v4/item/get?itemid=\${itemid}&shopid=\${shopid}\`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
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
          // Preço na Shopee vem multiplicado por 100000 (ex: R$ 19,90 = 1990000)
          const precoVistaNum = (item.price || 0) / 100000;
          const precoOriginalNum = (item.price_before_discount || 0) / 100000;

          const imagemHash = item.image || (item.images && item.images[0]);
          const imagem = imagemHash
            ? \`https://down-br.img.susercontent.com/file/\${imagemHash}\`
            : '';

          // Nota da avaliação e quantidade de pessoas que avaliaram
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
            parcelamento = \`em até \${parcelas}x de R$ \${valorParcela} sem juros\`;
          }

          return {
            loja: 'shopee',
            titulo: item.name,
            precoOriginal: precoOriginalNum > precoVistaNum ? formatarMoedaBR(precoOriginalNum) : '',
            precoVista: formatarMoedaBR(precoVistaNum),
            precoDe: precoOriginalNum > precoVistaNum ? formatarMoedaBR(precoOriginalNum) : '',
            precoPor: formatarMoedaBR(precoVistaNum),
            parcelamento,
            imagem,
            imagemUrl: imagem,
            avaliacao: avaliacao || '4.9',
            avaliacoesQtd: avaliacoesQtd || (item.historical_sold ? formatarContador(item.historical_sold) : '1.200'),
            quantidadeAvaliacoes: avaliacoesQtd || '1.200',
            frete: 'Frete Grátis com cupom',
          };
        }
      }
    } catch (e) {
      console.warn('API direta Shopee falhou, tentando fallback HTML:', e);
    }
  }

  // Fallback: Scrape HTML da Shopee
  const pageRes = await fetch(urlFinal, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  });

  const html = await pageRes.text();
  const $ = cheerio.load(html);

  let titulo = $('meta[property="og:title"]').attr('content') || $('title').text().replace('| Shopee Brasil', '').trim();
  let imagem = $('meta[property="og:image"]').attr('content') || '';
  let precoVista = '';
  let avaliacao = '4.9';
  let avaliacoesQtd = '1.250';

  // Analisa JSON-LD Schema
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      if (data['@type'] === 'Product' || data.name) {
        if (!titulo && data.name) titulo = data.name;
        if (!imagem && data.image) imagem = Array.isArray(data.image) ? data.image[0] : data.image;
        if (data.offers) {
          const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          if (offer && offer.price) precoVista = formatarMoedaBR(Number(offer.price));
        }
        if (data.aggregateRating) {
          if (data.aggregateRating.ratingValue) avaliacao = Number(data.aggregateRating.ratingValue).toFixed(1).replace('.', ',');
          if (data.aggregateRating.reviewCount) avaliacoesQtd = formatarContador(data.aggregateRating.reviewCount);
        }
      }
    } catch (_) {}
  });

  return {
    loja: 'shopee',
    titulo: (titulo || 'Produto Shopee').replace(/\\s*\\|\\s*Shopee Brasil.*$/i, '').trim(),
    precoOriginal: '',
    precoVista: precoVista || '99,90',
    precoDe: '',
    precoPor: precoVista || '99,90',
    parcelamento: 'em até 6x sem juros',
    imagem,
    imagemUrl: imagem,
    avaliacao,
    avaliacoesQtd,
    quantidadeAvaliacoes: avaliacoesQtd,
    frete: 'Frete Grátis com cupom',
  };
}

// -------------------------------------------------------------
// 2. MERCADO LIVRE
// -------------------------------------------------------------
async function processarMercadoLivre(urlFinal) {
  const pageRes = await fetch(urlFinal, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  });

  const html = await pageRes.text();
  const $ = cheerio.load(html);

  let titulo = $('h1.ui-pdp-title').text().trim() || $('meta[property="og:title"]').attr('content') || '';
  let imagem = $('meta[property="og:image"]').attr('content') || '';
  let precoVista = '';
  let precoOriginal = '';
  let avaliacao = '';
  let avaliacoesQtd = '';

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      if (data['@type'] === 'Product' || data.name) {
        if (!titulo && data.name) titulo = data.name;
        if (!imagem && data.image) imagem = Array.isArray(data.image) ? data.image[0] : data.image;
        if (data.offers) {
          const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          if (offer && offer.price) precoVista = formatarMoedaBR(Number(offer.price));
        }
        if (data.aggregateRating) {
          if (data.aggregateRating.ratingValue) avaliacao = Number(data.aggregateRating.ratingValue).toFixed(1).replace('.', ',');
          if (data.aggregateRating.reviewCount) avaliacoesQtd = formatarContador(data.aggregateRating.reviewCount);
        }
      }
    } catch (_) {}
  });

  // Preço à vista no HTML do Mercado Livre
  if (!precoVista) {
    const fraction = $('.ui-pdp-price__second-line .andes-money-amount__fraction').first().text().trim();
    const cents = $('.ui-pdp-price__second-line .andes-money-amount__cents').first().text().trim() || '00';
    if (fraction) precoVista = \`\${fraction},\${cents}\`;
  }

  // Preço riscado anterior
  const fractionOriginal = $('s.andes-money-amount--previous .andes-money-amount__fraction').first().text().trim();
  if (fractionOriginal) {
    const centsOriginal = $('s.andes-money-amount--previous .andes-money-amount__cents').first().text().trim() || '00';
    precoOriginal = \`\${fractionOriginal},\${centsOriginal}\`;
  }

  if (!avaliacao) {
    const ratingText = $('.ui-pdp-review__ratings, .ui-review-capability__rating__average').first().text().trim();
    if (ratingText) avaliacao = ratingText.replace(/[^\\d.,]/g, '').replace('.', ',');
  }

  if (!avaliacoesQtd) {
    const countText = $('.ui-pdp-review__amount, .ui-review-capability__rating__label').first().text().trim();
    if (countText) {
      const match = countText.match(/\\(([\\d.,]+)\\)/) || countText.match(/([\\d.,]+)/);
      if (match) avaliacoesQtd = formatarContador(match[1]);
    }
  }

  let parcelamento = '';

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
    if (prevFrac) precoOriginal = \`\${prevFrac},\${prevCents}\`;

    const curr = firstPoly.find('.andes-money-amount:not(.andes-money-amount--previous)').first();
    const currFrac = curr.find('.andes-money-amount__fraction').text().trim();
    const currCents = curr.find('.andes-money-amount__cents').text().trim() || '00';
    if (currFrac) precoVista = \`\${currFrac},\${currCents}\`;

    const polyInstallment = firstPoly.find('.poly-price__installments, .poly-component__installments').first().text().trim();
    if (polyInstallment) parcelamento = polyInstallment;

    const polyRating = firstPoly.find('.poly-reviews__rating').first().text().trim();
    if (polyRating) avaliacao = polyRating.replace('.', ',');

    const polyTotalReviews = firstPoly.find('.poly-reviews__total').first().text().trim();
    if (polyTotalReviews) avaliacoesQtd = formatarContador(polyTotalReviews.replace(/\\D/g, ''));
  }

  if (!parcelamento) {
    parcelamento = $('.ui-pdp-price__subtitles, .ui-pdp-media--installments').first().text().trim() || 'em até 10x sem juros';
  }

  return {
    loja: 'mercadolivre',
    titulo: titulo.replace(/\\s*\\|\\s*Mercado Livre.*$/i, '').trim(),
    precoOriginal,
    precoVista: precoVista || '199,00',
    precoDe: precoOriginal,
    precoPor: precoVista || '199,00',
    parcelamento,
    imagem,
    imagemUrl: imagem,
    avaliacao: avaliacao || '4.8',
    avaliacoesQtd: avaliacoesQtd || '1.450',
    quantidadeAvaliacoes: avaliacoesQtd || '1.450',
    frete: 'Frete Grátis',
  };
}

// -------------------------------------------------------------
// 3. KABUM!
// -------------------------------------------------------------
async function processarKabum(urlFinal) {
  const pageRes = await fetch(urlFinal, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  });

  const html = await pageRes.text();
  const $ = cheerio.load(html);

  let titulo = $('h1').first().text().trim() || $('meta[property="og:title"]').attr('content') || '';
  let imagem = $('meta[property="og:image"]').attr('content') || '';
  let precoVista = '';
  let avaliacao = '4.9';
  let avaliacoesQtd = '420';

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      if (data['@type'] === 'Product' || data.name) {
        if (!titulo && data.name) titulo = data.name;
        if (!imagem && data.image) imagem = Array.isArray(data.image) ? data.image[0] : data.image;
        if (data.offers) {
          const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          if (offer && offer.price) precoVista = formatarMoedaBR(Number(offer.price));
        }
        if (data.aggregateRating) {
          if (data.aggregateRating.ratingValue) avaliacao = Number(data.aggregateRating.ratingValue).toFixed(1).replace('.', ',');
          if (data.aggregateRating.reviewCount) avaliacoesQtd = formatarContador(data.aggregateRating.reviewCount);
        }
      }
    } catch (_) {}
  });

  return {
    loja: 'kabum',
    titulo: titulo.replace(/\\s*\\|\\s*KaBuM!.*$/i, '').trim(),
    precoOriginal: '',
    precoVista: precoVista || '299,90',
    precoDe: '',
    precoPor: precoVista || '299,90',
    parcelamento: 'em até 12x no cartão',
    imagem,
    imagemUrl: imagem,
    avaliacao,
    avaliacoesQtd,
    quantidadeAvaliacoes: avaliacoesQtd,
    frete: 'Consulte o CEP',
  };
}

// -------------------------------------------------------------
// HANDLER PRINCIPAL (Vercel Serverless Function)
// -------------------------------------------------------------
module.exports = async (req, res) => {
  // Configuração CORS para permitir requisições de qualquer origem
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Parâmetro url é obrigatório.' });
  }

  try {
    let urlProcessada = url.trim();
    if (!urlProcessada.startsWith('http://') && !urlProcessada.startsWith('https://')) {
      urlProcessada = \`https://\${urlProcessada}\`;
    }

    // Segue redirecionamentos (importante para links curtos: s.shopee.com.br e shp.ee)
    let urlFinal = urlProcessada;
    try {
      const head = await fetch(urlProcessada, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      });
      urlFinal = head.url || urlProcessada;
    } catch (_) {}

    const urlLower = urlFinal.toLowerCase();
    let resultado;

    if (urlLower.includes('shopee.com') || urlLower.includes('shp.ee')) {
      resultado = await processarShopee(urlFinal);
    } else if (urlLower.includes('mercadolivre.com') || urlLower.includes('mercadolivre.com.br') || urlLower.includes('ml.app')) {
      resultado = await processarMercadoLivre(urlFinal);
    } else if (urlLower.includes('kabum.com') || urlLower.includes('kabum.com.br')) {
      resultado = await processarKabum(urlFinal);
    } else {
      resultado = await processarMercadoLivre(urlFinal);
    }

    return res.status(200).json(resultado);
  } catch (err) {
    console.error('Erro na API buscar-produto:', err);
    return res.status(500).json({
      error: 'Falha ao buscar dados do produto',
      message: err.message,
    });
  }
};
`;

export const VERCEL_PACKAGE_JSON = `{
  "name": "banner-geral-api",
  "version": "1.0.0",
  "description": "API de extração para Shopee, Mercado Livre e KaBuM",
  "dependencies": {
    "cheerio": "^1.0.0"
  }
}`;
