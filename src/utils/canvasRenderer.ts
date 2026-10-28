import { LojaTipo, ProdutoData, TemaLoja } from '../types';
import {
  LOGO_FCS_IMG,
  LOGO_SHOPEE_IMG,
  LOGO_MERCADOLIVRE_IMG,
  LOGO_KABUM_IMG,
  LOGO_WHATSAPP_SVG,
} from '../assets/logos';

export const TEMAS_LOJAS: Record<LojaTipo, TemaLoja> = {
  shopee: {
    nome: 'Shopee',
    fundoBanner: '#EE4D2D',
    fundoHeaderLogo: '#FFFFFF',
    textoLogoAzul: '#EE4D2D',
    tituloTexto: '#1E293B',
    precoPorTexto: '#EE4D2D',
    precoDeTexto: '#64748B',
    estrelaCor: '#FFB800',
    badgeCor: '#FFF1EE',
    badgeTexto: '#EE4D2D',
    accent: '#EE4D2D',
  },
  mercadolivre: {
    nome: 'Mercado Livre',
    fundoBanner: '#FFE600',
    fundoHeaderLogo: '#FFFFFF',
    textoLogoAzul: '#2D3277',
    tituloTexto: '#2D3277',
    precoPorTexto: '#2D3277',
    precoDeTexto: '#737373',
    estrelaCor: '#2D3277',
    badgeCor: '#FFFFFF',
    badgeTexto: '#2D3277',
    accent: '#2D3277',
  },
  kabum: {
    nome: 'KaBuM!',
    fundoBanner: '#FF6500',
    fundoHeaderLogo: '#FFFFFF',
    textoLogoAzul: '#0060B1',
    tituloTexto: '#0060B1',
    precoPorTexto: '#FF6500',
    precoDeTexto: '#334155',
    estrelaCor: '#FFD700',
    badgeCor: '#FFFFFF',
    badgeTexto: '#0060B1',
    accent: '#0060B1',
  },
};

// Cache de imagens em memória
const imgCache = new Map<string, HTMLImageElement>();

function carregarImagem(src: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  if (imgCache.has(src)) {
    const cached = imgCache.get(src)!;
    if (cached.complete && cached.naturalWidth > 0) return Promise.resolve(cached);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      // Se der erro de CORS em URL externa, tenta via proxy local se disponível
      if (src.startsWith('http') && !src.includes('/api/proxy-image')) {
        const proxySrc = `/api/proxy-image?url=${encodeURIComponent(src)}`;
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = 'anonymous';
        fallbackImg.onload = () => {
          imgCache.set(src, fallbackImg);
          resolve(fallbackImg);
        };
        fallbackImg.onerror = () => resolve(null);
        fallbackImg.src = proxySrc;
      } else {
        resolve(null);
      }
    };
    img.src = src;
  });
}

function quebrarTexto(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function desenharBanner(
  canvas: HTMLCanvasElement,
  dados: ProdutoData,
  logoCustomFcs?: string | null
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const LARGURA = 1080;
  const ALTURA_TOTAL = 1500;

  canvas.width = LARGURA;
  canvas.height = ALTURA_TOTAL;

  const loja = dados.loja || 'shopee';
  const tema = TEMAS_LOJAS[loja] || TEMAS_LOJAS.shopee;

  // 1. Carrega logos oficiais do usuário
  const [logoLojaImg, logoFcsImg, whatsAppImg, produtoImg] = await Promise.all([
    carregarImagem(
      loja === 'shopee'
        ? LOGO_SHOPEE_IMG
        : loja === 'kabum'
        ? LOGO_KABUM_IMG
        : LOGO_MERCADOLIVRE_IMG
    ),
    carregarImagem(logoCustomFcs || LOGO_FCS_IMG),
    carregarImagem(LOGO_WHATSAPP_SVG),
    carregarImagem(dados.imagemLocal || dados.imagemUrl),
  ]);

  // 2. Fundo do Banner com gradiente sutil
  const gradFundo = ctx.createLinearGradient(0, 0, 0, ALTURA_TOTAL);
  if (loja === 'shopee') {
    gradFundo.addColorStop(0, '#FA5230');
    gradFundo.addColorStop(1, '#D83818');
  } else if (loja === 'mercadolivre') {
    gradFundo.addColorStop(0, '#FFE600');
    gradFundo.addColorStop(1, '#F3DC00');
  } else {
    gradFundo.addColorStop(0, '#FF7315');
    gradFundo.addColorStop(1, '#E65100');
  }
  ctx.fillStyle = gradFundo;
  ctx.fillRect(0, 0, LARGURA, ALTURA_TOTAL);

  // 3. TOPO: LOGO FCS REAL (logofcs.png em anexo)
  const logoL = 190;
  let logoA = 120;
  if (logoFcsImg && logoFcsImg.naturalWidth > 0) {
    logoA = (logoFcsImg.naturalHeight / logoFcsImg.naturalWidth) * logoL;
  }
  const logoX = (LARGURA - logoL) / 2;
  const logoY = 12;

  if (logoFcsImg && logoFcsImg.complete && logoFcsImg.naturalWidth > 0) {
    ctx.drawImage(logoFcsImg, logoX, logoY, logoL, logoA);
  } else {
    ctx.font = "900 32px 'Montserrat', sans-serif";
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('FCS', LARGURA / 2, logoY + 45);
  }

  // 4. LOGO DA LOJA (Shopee, Mercado Livre ou KaBuM oficiais)
  const posYLogoLoja = logoY + logoA + 12;
  let logoW = 320;
  let logoH = 90;

  if (loja === 'shopee') {
    logoW = 340;
    logoH = logoLojaImg && logoLojaImg.naturalWidth > 0
      ? (logoLojaImg.naturalHeight / logoLojaImg.naturalWidth) * logoW
      : 108;
  } else if (loja === 'kabum') {
    logoW = 330;
    logoH = logoLojaImg && logoLojaImg.naturalWidth > 0
      ? (logoLojaImg.naturalHeight / logoLojaImg.naturalWidth) * logoW
      : 88;
  } else {
    // Mercado Livre
    logoW = 330;
    logoH = logoLojaImg && logoLojaImg.naturalWidth > 0
      ? (logoLojaImg.naturalHeight / logoLojaImg.naturalWidth) * logoW
      : 84;
  }

  if (logoLojaImg && logoLojaImg.complete && logoLojaImg.naturalWidth > 0) {
    ctx.drawImage(
      logoLojaImg,
      (LARGURA - logoW) / 2,
      posYLogoLoja,
      logoW,
      logoH
    );
  } else {
    ctx.font = "900 38px 'Montserrat', sans-serif";
    ctx.fillStyle = tema.textoLogoAzul;
    ctx.textAlign = 'center';
    ctx.fillText(loja.toUpperCase(), LARGURA / 2, posYLogoLoja + 50);
  }

  // 5. CONTAINER BRANCO FIXO (CARD DO PRODUTO)
  const imgBoxWidth = 780;
  const imgBoxHeight = 650;
  const imgBoxX = (LARGURA - imgBoxWidth) / 2;
  const imgBoxY = posYLogoLoja + logoH + 20;
  const radius = 32;

  // Texto Vertical na lateral esquerda do card
  ctx.save();
  ctx.translate(imgBoxX - 35, imgBoxY + imgBoxHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = "700 18px 'Montserrat', sans-serif";
  ctx.fillStyle = loja === 'mercadolivre' ? '#2D3277' : '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('*PRODUTO SUJEITO A ALTERAÇÃO DE PREÇO E ESTOQUE*', 0, 0);
  ctx.restore();

  // Desenho com sombra do card branco
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 14;

  ctx.beginPath();
  ctx.moveTo(imgBoxX + radius, imgBoxY);
  ctx.lineTo(imgBoxX + imgBoxWidth - radius, imgBoxY);
  ctx.quadraticCurveTo(imgBoxX + imgBoxWidth, imgBoxY, imgBoxX + imgBoxWidth, imgBoxY + radius);
  ctx.lineTo(imgBoxX + imgBoxWidth, imgBoxY + imgBoxHeight - radius);
  ctx.quadraticCurveTo(imgBoxX + imgBoxWidth, imgBoxY + imgBoxHeight, imgBoxX + imgBoxWidth - radius, imgBoxY + imgBoxHeight);
  ctx.lineTo(imgBoxX + radius, imgBoxY + imgBoxHeight);
  ctx.quadraticCurveTo(imgBoxX, imgBoxY + imgBoxHeight, imgBoxX, imgBoxY + imgBoxHeight - radius);
  ctx.lineTo(imgBoxX, imgBoxY + radius);
  ctx.quadraticCurveTo(imgBoxX, imgBoxY, imgBoxX + radius, imgBoxY);
  ctx.closePath();
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  // Clip para renderizar a imagem dentro do card com borda arredondada
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(imgBoxX + radius, imgBoxY);
  ctx.lineTo(imgBoxX + imgBoxWidth - radius, imgBoxY);
  ctx.quadraticCurveTo(imgBoxX + imgBoxWidth, imgBoxY, imgBoxX + imgBoxWidth, imgBoxY + radius);
  ctx.lineTo(imgBoxX + imgBoxWidth, imgBoxY + imgBoxHeight - radius);
  ctx.quadraticCurveTo(imgBoxX + imgBoxWidth, imgBoxY + imgBoxHeight, imgBoxX + imgBoxWidth - radius, imgBoxY + imgBoxHeight);
  ctx.lineTo(imgBoxX + radius, imgBoxY + imgBoxHeight);
  ctx.quadraticCurveTo(imgBoxX, imgBoxY + imgBoxHeight, imgBoxX, imgBoxY + imgBoxHeight - radius);
  ctx.lineTo(imgBoxX, imgBoxY + radius);
  ctx.quadraticCurveTo(imgBoxX, imgBoxY, imgBoxX + radius, imgBoxY);
  ctx.closePath();
  ctx.clip();

  // Renderiza a imagem do produto
  if (produtoImg && produtoImg.complete && produtoImg.naturalWidth > 0) {
    const pad = 28;
    const maxW = imgBoxWidth - pad * 2;
    const maxH = imgBoxHeight - pad * 2;

    const imgW = produtoImg.naturalWidth || produtoImg.width;
    const imgH = produtoImg.naturalHeight || produtoImg.height;

    const escala = Math.min(maxW / imgW, maxH / imgH);
    const destW = imgW * escala;
    const destH = imgH * escala;

    const posX = imgBoxX + (imgBoxWidth - destW) / 2;
    const posY = imgBoxY + (imgBoxHeight - destH) / 2;

    ctx.drawImage(produtoImg, posX, posY, destW, destH);
  } else {
    ctx.fillStyle = '#94A3B8';
    ctx.font = "700 28px 'Montserrat', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('Sem Imagem do Produto', imgBoxX + imgBoxWidth / 2, imgBoxY + imgBoxHeight / 2);
  }
  ctx.restore();

  // Badge no canto do Card (ex: "OFERTA OFICIAL", "FRETE GRÁTIS" ou "CUPOM")
  if (dados.cupom || dados.frete) {
    const textoBadge = dados.cupom ? `CUPOM: ${dados.cupom.toUpperCase()}` : dados.frete.toUpperCase();
    ctx.save();
    ctx.font = "800 18px 'Montserrat', sans-serif";
    const largTexto = ctx.measureText(textoBadge).width;
    const badgeW = largTexto + 36;
    const badgeH = 38;
    const badgeX = imgBoxX + imgBoxWidth - badgeW - 16;
    const badgeY = imgBoxY + 16;

    ctx.fillStyle = loja === 'shopee' ? '#EE4D2D' : loja === 'mercadolivre' ? '#2D3277' : '#0060B1';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 19);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textoBadge, badgeX + badgeW / 2, badgeY + badgeH / 2);
    ctx.restore();
  }

  // 6. INFORMAÇÕES DO PRODUTO (Abaixo do Card)
  let cursorY = imgBoxY + imgBoxHeight + 46;
  const startX = imgBoxX;
  const corTextoPrincipal = loja === 'mercadolivre' ? '#2D3277' : '#FFFFFF';

  // Título do Produto
  const tituloLimpo = dados.descricao?.trim();
  if (tituloLimpo) {
    ctx.fillStyle = corTextoPrincipal;
    ctx.font = "800 36px 'Montserrat', sans-serif";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    const linhasTitulo = quebrarTexto(ctx, tituloLimpo, imgBoxWidth);
    const linhasExibidas = linhasTitulo.slice(0, 2);
    linhasExibidas.forEach((linha, index) => {
      let textoLinha = linha;
      if (index === 1 && linhasTitulo.length > 2) textoLinha += '...';
      ctx.fillText(textoLinha, startX, cursorY);
      cursorY += 44;
    });
    cursorY += 10;
  }

  // 7. AVALIAÇÃO + QUANTIDADE DE AVALIAÇÕES (Requisito Explícito do Usuário!)
  const avaliacaoStr = dados.avaliacao?.trim() || '';
  const avaliacoesQtdStr = dados.avaliacoesQtd?.trim() || '';

  if (avaliacaoStr && avaliacaoStr !== '0') {
    const notaFloat = parseFloat(avaliacaoStr.replace(',', '.')) || 0;
    if (notaFloat > 0) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      const corEstrela = loja === 'mercadolivre' ? '#2D3277' : '#FFD700';

      ctx.font = "800 28px 'Montserrat', sans-serif";
      ctx.fillStyle = corTextoPrincipal;
      const textoNota = `${avaliacaoStr} `;
      ctx.fillText(textoNota, startX, cursorY);

      const largNota = ctx.measureText(textoNota).width;
      let posicaoXEstrela = startX + largNota + 8;

      // Desenho das 5 estrelas proporcionais
      const raioEstrela = 14;
      for (let i = 0; i < 5; i++) {
        let percentual = 0;
        if (notaFloat >= i + 1) percentual = 1;
        else if (notaFloat > i) percentual = notaFloat - i;

        ctx.save();
        ctx.translate(posicaoXEstrela, cursorY - 9);

        // Contorno
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          ctx.lineTo(
            Math.cos(((18 + j * 72) / 180) * Math.PI) * raioEstrela,
            -Math.sin(((18 + j * 72) / 180) * Math.PI) * raioEstrela
          );
          ctx.lineTo(
            Math.cos(((54 + j * 72) / 180) * Math.PI) * (raioEstrela * 0.42),
            -Math.sin(((54 + j * 72) / 180) * Math.PI) * (raioEstrela * 0.42)
          );
        }
        ctx.closePath();
        ctx.strokeStyle = corEstrela;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Preenchimento parcial proporcional
        ctx.beginPath();
        ctx.rect(-raioEstrela - 2, -raioEstrela - 2, (raioEstrela * 2 + 4) * percentual, raioEstrela * 2 + 4);
        ctx.clip();

        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          ctx.lineTo(
            Math.cos(((18 + j * 72) / 180) * Math.PI) * raioEstrela,
            -Math.sin(((18 + j * 72) / 180) * Math.PI) * raioEstrela
          );
          ctx.lineTo(
            Math.cos(((54 + j * 72) / 180) * Math.PI) * (raioEstrela * 0.42),
            -Math.sin(((54 + j * 72) / 180) * Math.PI) * (raioEstrela * 0.42)
          );
        }
        ctx.closePath();
        ctx.fillStyle = corEstrela;
        ctx.fill();
        ctx.restore();

        posicaoXEstrela += raioEstrela * 2 + 8;
      }

      // Quantidade de Avaliações (ex: "(1.450 avaliações)")
      if (avaliacoesQtdStr) {
        ctx.font = "700 24px 'Montserrat', sans-serif";
        ctx.fillStyle = loja === 'mercadolivre' ? '#4A4F8A' : 'rgba(255, 255, 255, 0.9)';
        const textoQtd = `(${avaliacoesQtdStr} avaliações)`;
        ctx.fillText(textoQtd, posicaoXEstrela + 10, cursorY);
      }

      cursorY += 46;
    }
  }

  // 8. PREÇO DE (Riscado)
  const precoDe = dados.precoOriginal?.trim() || '';
  if (precoDe) {
    ctx.font = "700 28px 'Montserrat', sans-serif";
    ctx.fillStyle = loja === 'mercadolivre' ? '#6B7280' : 'rgba(255, 255, 255, 0.85)';
    const textoPrecoDe = `De R$ ${precoDe}`;
    ctx.fillText(textoPrecoDe, startX, cursorY);

    const largDe = ctx.measureText(textoPrecoDe).width;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, cursorY - 9);
    ctx.lineTo(startX + largDe, cursorY - 9);
    ctx.stroke();

    cursorY += 44;
  }

  // 9. PREÇO POR (Destaque Principal)
  const precoPor = dados.precoVista?.trim() || '';
  if (precoPor && precoPor !== '0,00') {
    let parteInteira = precoPor;
    let centavos = '00';

    if (precoPor.includes(',')) {
      const partes = precoPor.split(',');
      parteInteira = partes[0];
      centavos = partes[1] || '00';
    } else if (precoPor.includes('.')) {
      const partes = precoPor.split('.');
      parteInteira = partes[0];
      centavos = partes[1] || '00';
    }

    ctx.fillStyle = corTextoPrincipal;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    const posYBase = cursorY + 68;

    // "por"
    ctx.font = "800 30px 'Montserrat', sans-serif";
    ctx.fillText('por', startX, posYBase - 65);

    // "R$"
    ctx.font = "900 60px 'Montserrat', sans-serif";
    ctx.fillText('R$', startX, posYBase);

    const largRS = ctx.measureText('R$').width;
    const posXInteiro = startX + largRS + 14;

    // Número inteiro (ex: 1.899)
    ctx.font = "900 96px 'Montserrat', sans-serif";
    ctx.fillText(parteInteira, posXInteiro, posYBase);

    const largInteiro = ctx.measureText(parteInteira).width;

    // Centavos (no topo)
    ctx.font = "900 48px 'Montserrat', sans-serif";
    ctx.textBaseline = 'top';
    ctx.fillText(centavos, posXInteiro + largInteiro + 4, cursorY + 4);

    const largCentavos = ctx.measureText(centavos).width;

    // "no Pix" / "à vista"
    ctx.font = "900 46px 'Montserrat', sans-serif";
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('no Pix', posXInteiro + largInteiro + largCentavos + 22, posYBase);

    cursorY += 124;
  }

  // 10. PARCELAMENTO
  const parcelamento = dados.parcelado?.trim() || '';
  if (parcelamento) {
    ctx.font = "700 28px 'Montserrat', sans-serif";
    ctx.fillStyle = corTextoPrincipal;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`💳 ${parcelamento}`, startX, cursorY);
  }

  // 11. RODAPÉ FIXO NA BASE (WHATSAPP FCS)
  const rodapeY = ALTURA_TOTAL - 55;
  const textoNumero = dados.whatsapp?.trim() || '(71) 98818-5775';
  const tamanhoIcone = 48;

  ctx.font = "900 42px 'Montserrat', sans-serif";
  const larguraTexto = ctx.measureText(textoNumero).width;
  const espacoTotal = tamanhoIcone + 16 + larguraTexto;
  const posXInicio = (LARGURA - espacoTotal) / 2;

  if (whatsAppImg && whatsAppImg.complete && whatsAppImg.naturalWidth > 0) {
    ctx.drawImage(whatsAppImg, posXInicio, rodapeY - 38, tamanhoIcone, tamanhoIcone);
  }

  ctx.fillStyle = corTextoPrincipal;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(textoNumero, posXInicio + tamanhoIcone + 16, rodapeY);
}
