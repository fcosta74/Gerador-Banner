const URL_API_VERCEL = "https://banner-geral.vercel.app/api/buscar-produto";

// ==========================================
// 1. PALETA DE CORES E VARIÁVEIS GLOBAIS
// ==========================================
const TEMAS_LOJAS = {
  kabum: {
    fundoBanner: "#FF6500",
    fundoHeaderLogo: "#FFFFFF",
    textoLogoAzul: "#0060B1",
    tituloTexto: "#FFFFFF",
    precoPorTexto: "#FFFFFF",
    precoDeTexto: "#000000",
    estrelaCor: "#FFD700"
  },
  mercadolivre: {
    fundoBanner: "#FFE600",
    fundoHeaderLogo: "#FFFFFF",
    textoLogoAzul: "#2D3277",
    tituloTexto: "#2D3277",
    precoPorTexto: "#2D3277",
    precoDeTexto: "#737373",
    estrelaCor: "#2D3277"
  }
};

let imagemProdutoCarregada = null;

const logosLojas = {
  mercadolivre: new Image(),
  kabum: new Image(),
};

logosLojas.mercadolivre.src = "./img/logoml.png";
logosLojas.kabum.src = "./img/logokabum.png";

const meuLogo = new Image();
meuLogo.src = './logofcs.ico';

const whatsAppIcon = new Image();
whatsAppIcon.src = "./img/whatsapp.png";

// Re-desenhar banner quando assets carregarem
[logosLojas.mercadolivre, logosLojas.kabum, meuLogo, whatsAppIcon].forEach(img => {
  img.onload = () => { if (typeof gerarBanner === "function") gerarBanner(); };
});

if (!document.getElementById("google-font-montserrat")) {
  const linkFont = document.createElement("link");
  linkFont.id = "google-font-montserrat";
  linkFont.rel = "stylesheet";
  linkFont.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&display=swap";
  document.head.appendChild(linkFont);
}

// ==========================================
// 2. FUNÇÕES AUXILIARES
// ==========================================
function quebrarTexto(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function decodificarHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// ==========================================
// 3. RENDERIZAÇÃO DO BANNER (CANVAS)
// ==========================================
function gerarBanner() {
  const canvas = document.getElementById("bannerCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  // Captura dos valores do formulário
  const loja = document.getElementById("loja")?.value || "mercadolivre";
  
  // Captura a descrição
  const inputDescricao = document.getElementById("descricao");
  const descricaoTexto = inputDescricao ? inputDescricao.value : "";
  
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = descricaoTexto;
  let tituloLimpo = tempDiv.textContent || tempDiv.innerText || descricaoTexto;

  const precoDe = document.getElementById("precoOriginal")?.value.trim() || "";
  const precoPor = document.getElementById("precoVista")?.value.trim() || "";
  const parcelamento = (
    document.getElementById("parcelado")?.value || 
    document.getElementById("parcelamento")?.value || 
    ""
  ).trim();
  const avaliacao = document.getElementById("avaliacao")?.value.trim() || "";
  
  // Aplicação do Tema da Loja
  const tema = TEMAS_LOJAS[loja] || TEMAS_LOJAS.mercadolivre;
  const corFundo = tema.fundoBanner;
  const corTexto = tema.tituloTexto;

  const logoAtual = logosLojas[loja] || logosLojas.mercadolivre;

  // DIMENSÕES FIXAS DO BANNER (Formato 9:16)
  const LARGURA = 1080;
  const ALTURA_TOTAL = 1500;

  canvas.width = LARGURA;
  canvas.height = ALTURA_TOTAL;

  // Fundo do Banner
  ctx.fillStyle = corFundo;
  ctx.fillRect(0, 0, LARGURA, ALTURA_TOTAL);

  // TOPO: SUA LOGO (FCS)
  const logoL = 200; 
  const logoA = meuLogo.naturalWidth > 0 ? (meuLogo.height / meuLogo.width) * logoL : 80; 
  const logoX = (canvas.width - logoL) / 2; 
  const logoY = 1; 

  if (meuLogo.complete && meuLogo.naturalWidth > 0) {
    ctx.drawImage(meuLogo, logoX, logoY, logoL, logoA);
  }

  // LOGO DA LOJA
  const configLogos = {
    mercadolivre: { w: 300, h: 100 },
    kabum: { w: 300, h: 120 },
  };
  const tamanho = configLogos[loja] || configLogos.mercadolivre;
  const posYLogoLoja = logoY + logoA + 15;

  if (logoAtual && logoAtual.complete && logoAtual.naturalWidth > 0) {
    ctx.drawImage(logoAtual, (canvas.width - tamanho.w) / 2, posYLogoLoja, tamanho.w, tamanho.h);
  } else {
    ctx.font = "800 32px 'Montserrat', sans-serif";
    ctx.fillStyle = corTexto;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(loja.toUpperCase(), canvas.width / 2, posYLogoLoja + 40);
  }

  // CONTAINER BRANCO FIXO
  const imgBoxWidth = 750;
  const imgBoxHeight = 650;  
  const imgBoxX = (LARGURA - imgBoxWidth) / 2;  
  const imgBoxY = posYLogoLoja + tamanho.h + 20;
  const radius = 32;

  // TEXTO VERTICAL (Esquerda do card)
  ctx.save();
  ctx.translate(120, imgBoxY + (imgBoxHeight / 2));
  ctx.rotate(-Math.PI / 2);
  ctx.font = "600 20px Montserrat, Arial";
  ctx.fillStyle = corTexto;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("*Produto sujeito a alteração de preço e estoque*", 0, 0);
  ctx.restore();

  // DESENHO DO CARD BRANCO
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
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.clip();

  // RENDERIZAÇÃO DA IMAGEM DO PRODUTO
  const temImagem = (imagemProdutoCarregada && imagemProdutoCarregada.complete && imagemProdutoCarregada.naturalWidth > 0);

  if (temImagem) {
    const pad = 20;
    const maxW = imgBoxWidth - (pad * 2);
    const maxH = imgBoxHeight - (pad * 2);

    const imgW = imagemProdutoCarregada.naturalWidth || imagemProdutoCarregada.width;
    const imgH = imagemProdutoCarregada.naturalHeight || imagemProdutoCarregada.height;

    const escala = Math.min(maxW / imgW, maxH / imgH);
    const destW = imgW * escala;
    const destH = imgH * escala;

    const posX = imgBoxX + (imgBoxWidth - destW) / 2;
    const posY = imgBoxY + (imgBoxHeight - destH) / 2;

    ctx.drawImage(imagemProdutoCarregada, posX, posY, destW, destH);
  } else {
    ctx.fillStyle = "#888888";
    ctx.font = "700 28px Montserrat, Arial";
    ctx.textAlign = "center";
    ctx.fillText("Sem Imagem do Produto", imgBoxX + imgBoxWidth / 2, imgBoxY + imgBoxHeight / 2);
  }
  ctx.restore();

  // INFORMAÇÕES DO PRODUTO
  let cursorY = imgBoxY + imgBoxHeight + 50;
  const startX = imgBoxX;

  // TÍTULO DO PRODUTO
  if (tituloLimpo) {
    ctx.fillStyle = corTexto;
    ctx.font = "700 36px Montserrat, Arial";
    ctx.textAlign = "left";

    const linhasTitulo = quebrarTexto(ctx, tituloLimpo, imgBoxWidth);
    const linhasExibidas = linhasTitulo.slice(0, 3);
    linhasExibidas.forEach((linha, index) => {
      let textoLinha = linha;
      if (index === 2 && linhasTitulo.length > 3) textoLinha += "...";
      ctx.fillText(textoLinha, startX, cursorY);
      cursorY += 46;
    });
    cursorY += 15;
  }

  // AVALIAÇÃO (ESTRELAS)
  if (avaliacao && avaliacao !== "0") {
    const notaFloat = parseFloat(avaliacao.replace(",", ".")) || 0;
    if (notaFloat > 0) {
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      const corEstrela = tema.estrelaCor;
      const textoAvaliacao = `Avaliação / Clientes: ${avaliacao} `;

      ctx.font = "700 28px Montserrat, Arial";
      ctx.fillStyle = corTexto;
      ctx.fillText(textoAvaliacao, startX, cursorY);

      const largTextoAvaliacao = ctx.measureText(textoAvaliacao).width;
      let posicaoXEstrela = startX + largTextoAvaliacao + 14;

      const raioEstrela = 13;
      for (let i = 0; i < 5; i++) {
        let percentual = 0;
        if (notaFloat >= i + 1) percentual = 1;
        else if (notaFloat > i) percentual = notaFloat - i;

        ctx.save();
        ctx.translate(posicaoXEstrela, cursorY - 8);
        
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          ctx.lineTo(Math.cos((18 + j * 72) / 180 * Math.PI) * raioEstrela, -Math.sin((18 + j * 72) / 180 * Math.PI) * raioEstrela);
          ctx.lineTo(Math.cos((54 + j * 72) / 180 * Math.PI) * (raioEstrela * 0.42), -Math.sin((54 + j * 72) / 180 * Math.PI) * (raioEstrela * 0.42));
        }
        ctx.closePath();
        ctx.strokeStyle = corEstrela;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.rect(-raioEstrela - 2, -raioEstrela - 2, (raioEstrela * 2 + 4) * percentual, raioEstrela * 2 + 4);
        ctx.clip();

        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          ctx.lineTo(Math.cos((18 + j * 72) / 180 * Math.PI) * raioEstrela, -Math.sin((18 + j * 72) / 180 * Math.PI) * raioEstrela);
          ctx.lineTo(Math.cos((54 + j * 72) / 180 * Math.PI) * (raioEstrela * 0.42), -Math.sin((54 + j * 72) / 180 * Math.PI) * (raioEstrela * 0.42));
        }
        ctx.closePath();
        ctx.fillStyle = corEstrela;
        ctx.fill();
        ctx.restore();

        posicaoXEstrela += (raioEstrela * 2) + 6;
      }
      cursorY += 45;
    }
  }

  // PREÇO DE
  if (precoDe) {
    ctx.font = "600 30px Montserrat, Arial";
    ctx.fillStyle = tema.precoDeTexto || corTexto;
    ctx.fillText(`De R$ ${precoDe}`, startX, cursorY);

    const textWidth = ctx.measureText(`De R$ ${precoDe}`).width;
    ctx.strokeStyle = tema.precoDeTexto || corTexto;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, cursorY - 8);
    ctx.lineTo(startX + textWidth, cursorY - 8);
    ctx.stroke();

    cursorY += 45;
  }

  // PREÇO POR
  if (precoPor && precoPor !== "0,00") {
    let parteInteira = precoPor;
    let centavos = "00";

    if (precoPor.includes(",")) {
      const partes = precoPor.split(",");
      parteInteira = partes[0];
      centavos = partes[1] || "00";
    } else if (precoPor.includes(".")) {
      const partes = precoPor.split(".");
      parteInteira = partes[0];
      centavos = partes[1] || "00";
    }

    ctx.fillStyle = tema.precoPorTexto || corTexto;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    const posYBase = cursorY + 60;

    ctx.font = "800 30px Montserrat, Arial";
    ctx.fillText("por", startX, posYBase - 65);

    ctx.font = "900 58px Montserrat, Arial";
    ctx.fillText("R$", startX, posYBase);

    const largRS = ctx.measureText("R$").width;
    const posXInteiro = startX + largRS + 12;

    ctx.font = "900 90px Montserrat, Arial";
    ctx.fillText(parteInteira, posXInteiro, posYBase);

    const largInteiro = ctx.measureText(parteInteira).width;

    ctx.font = "900 46px Montserrat, Arial";
    ctx.textBaseline = "top";
    ctx.fillText(centavos, posXInteiro + largInteiro + 4, cursorY - 2);

    const largCentavos = ctx.measureText(centavos).width;

    ctx.font = "900 48px Montserrat, Arial";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("no Pix", posXInteiro + largInteiro + largCentavos + 20, posYBase);

    cursorY += 115;
  }

  // PARCELAMENTO
  if (parcelamento) {
    ctx.font = "600 30px Montserrat, Arial";
    ctx.fillStyle = corTexto;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(parcelamento, startX, cursorY);
  }

  // RODAPÉ FIXO NA BASE (WHATSAPP)
  const rodapeY = ALTURA_TOTAL - 60;
  const textoNumero = "(71) 98818-5775";
  const tamanhoIcone = 48;

  ctx.font = "800 44px Montserrat, Arial";
  const larguraTexto = ctx.measureText(textoNumero).width;
  const espacoTotal = tamanhoIcone + 15 + larguraTexto;
  const posXInicio = (LARGURA - espacoTotal) / 2;

  if (whatsAppIcon.complete && whatsAppIcon.naturalWidth > 0) {
    ctx.drawImage(whatsAppIcon, posXInicio, rodapeY - 38, tamanhoIcone, tamanhoIcone);
  }

  ctx.fillStyle = corTexto;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(textoNumero, posXInicio + tamanhoIcone + 15, rodapeY);
}

// ==========================================
// 4. MÉTODOS DE BUSCA E MÍDIA (API E PROXY)
// ==========================================
async function buscarDadosML() {
  const urlInput = document.getElementById("urlML")?.value.trim();
  const btnBuscar = document.getElementById("btnBuscarML");

  if (!urlInput) {
    alert("Por favor, insira uma URL de produto.");
    return;
  }

  if (btnBuscar) btnBuscar.innerText = "Buscando...";

  try {
    const res = await fetch(`${URL_API_VERCEL}?url=${encodeURIComponent(urlInput)}`);
    if (!res.ok) throw new Error("A API não conseguiu extrair os dados desta URL.");

    const data = await res.json();

    if (data.titulo && document.getElementById("descricao")) {
      document.getElementById("descricao").value = data.titulo;
    }

    const valPrecoDe = data.precoOriginal || data.precoDe;
    const valPrecoPor = data.precoVista || data.precoPor;

    if (valPrecoDe && document.getElementById("precoOriginal")) {
      document.getElementById("precoOriginal").value = valPrecoDe;
    }
    if (valPrecoPor && document.getElementById("precoVista")) {
      document.getElementById("precoVista").value = valPrecoPor;
    }
    if (data.parcelamento && document.getElementById("parcelamento")) {
      document.getElementById("parcelamento").value = data.parcelamento;
    }

    const urlImagem = data.imagem || data.imagemUrl;

    if (urlImagem) {
      carregarImagemSegura(urlImagem);
    } else {
      alert("Título extraído com sucesso, mas a imagem do produto não foi encontrada no link.");
      gerarBanner();
    }

  } catch (err) {
    console.error("Erro na busca do produto:", err);
    alert("Não foi possível carregar os dados automaticamente. Preencha manualmente.");
  } finally {
    if (btnBuscar) btnBuscar.innerText = "Buscar";
  }
}
function limparDadosML() {
  // 1. Limpa o campo de entrada da URL
  const urlInput = document.getElementById("urlML");
  if (urlInput) urlInput.value = "";

  // 2. Limpa os campos preenchidos pela busca
  const campos = ["descricao", "precoOriginal", "precoVista", "parcelamento"];
  campos.forEach(id => {
    const campo = document.getElementById(id);
    if (campo) campo.value = "";
  });

  // 3. Limpa a visualização da imagem ou canvas (se aplicável)
  const imgElement = document.getElementById("imagemProduto") || document.getElementById("previewImagem");
  if (imgElement) {
    if (imgElement.tagName === "IMG") imgElement.src = "";
    if (imgElement.tagName === "CANVAS") {
      const ctx = imgElement.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, imgElement.width, imgElement.height);
    }
  }

  // Opcional: foca novamente no campo de URL
  urlInput?.focus();
}
const proxies = [
  (url) => `https://wsrv.nl/?url=${encodeURIComponent(url)}`,
  (url) => `https://images.weserv.nl/?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
];

function carregarImagemSegura(urlOriginal) {
  let tentativa = 0;

  function tentarProximo() {
    if (tentativa >= proxies.length) {
      console.error("Todas as tentativas de carregar a imagem falharam.");
      alert("A imagem do produto foi bloqueada por segurança da loja. Faça o upload manual da foto no botão abaixo.");
      imagemProdutoCarregada = null;
      gerarBanner();
      return;
    }

    const urlComProxy = proxies[tentativa](urlOriginal);

    fetch(urlComProxy)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            imagemProdutoCarregada = img;
            gerarBanner();
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(blob);
      })
      .catch((err) => {
        console.warn(`Proxy ${tentativa + 1} falhou. Tentando o próximo...`, err);
        tentativa++;
        tentarProximo();
      });
  }

  tentarProximo();
}

function baixarBanner() {
  const canvas = document.getElementById("bannerCanvas");
  if (!canvas) {
    alert("Canvas do banner não encontrado!");
    return;
  }

  try {
    const link = document.createElement("a");
    link.download = `banner-oferta-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    alert("Erro ao baixar o banner. Se houver uma imagem externa bloqueada por CORS, faça o upload da foto via campo 'Imagem Manual'.");
    console.error(e);
  }
}

// ==========================================
// 5. MÓDULO DE LEGENDA
// ==========================================
function montarTextoLegenda() {
  const loja = document.getElementById("loja")?.value || "mercadolivre";
  
  const inputDescricao = document.getElementById("descricao");
  const descricaoBruta = inputDescricao ? inputDescricao.value.trim() : "";
  
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = descricaoBruta;
  const descricao = tempDiv.textContent || tempDiv.innerText || descricaoBruta;

  const precoDe = document.getElementById("precoOriginal")?.value.trim() || "";
  const precoPor = document.getElementById("precoVista")?.value.trim() || "";
  
  const parcelamento = (
    document.getElementById("parcelado")?.value || 
    document.getElementById("parcelamento")?.value || 
    ""
  ).trim();

  const cupom = document.getElementById("cupom")?.value.trim() || "";
  
  const freteSelect = document.getElementById("frete");
  let freteTexto = "🔍 Consulte o CEP e veja as condições";
  
  if (freteSelect && freteSelect.selectedIndex !== -1) {
    const selectedOption = freteSelect.options[freteSelect.selectedIndex].text;
    if (selectedOption !== "Selecione" && selectedOption !== "") {
      if (selectedOption.includes("Consulte o CEP")) {
        freteTexto = "🔍 Consulte o CEP e veja as condições";
      } else {
        freteTexto = selectedOption;
      }
    }
  }

  const link = (
    document.getElementById("urlML")?.value || 
    document.getElementById("linkProduto")?.value || 
    ""
  ).trim();

  const nomesLojas = {
    mercadolivre: "Mercado Livre",
    kabum: "KaBuM!"
  };
  const nomeLojaExibicao = nomesLojas[loja] || "Oferta";

  let textoLegenda = `🔥 *OFERTA IMPERDÍVEL - ${nomeLojaExibicao.toUpperCase()}* 🔥\n\n`;

  if (descricao) {
    textoLegenda += `🛍️ *${descricao}*\n\n`;
  }

  if (precoDe) {
    textoLegenda += `❌ De: ~R$ ${precoDe}~\n`;
  }

  if (precoPor && precoPor !== "0,00") {
    textoLegenda += `✅ *Por: R$ ${precoPor} no PIX*\n`;
  }

  if (parcelamento) {
    textoLegenda += `💳 ${parcelamento}\n`;
  }

  if (cupom) {
    textoLegenda += `🎟️ *Cupom:* ${cupom}\n`;
  }

  textoLegenda += `🚚 ${freteTexto}\n\n`;

  if (link) {
    textoLegenda += `🛒 *Compre aqui:* ${link}\n\n`;
  }

  textoLegenda += `⚠️ *Produto sujeito a alteração de preço e estoque sem aviso prévio.*`;

  return textoLegenda;
}

function atualizarCaixaLegenda() {
  const textareaLegenda = document.getElementById("legendaPronta");
  if (textareaLegenda) {
    textareaLegenda.value = montarTextoLegenda();
  }
}

function copiarLegenda() {
  const texto = montarTextoLegenda();
  navigator.clipboard.writeText(texto)
    .then(() => {})
    .catch(err => console.error("Erro ao copiar legenda: ", err));
}

function aplicarMascaraMoeda(input) {
  let valor = input.value.replace(/\D/g, "");

  if (!valor) {
    input.value = "";
    return;
  }

  valor = (parseFloat(valor) / 100).toFixed(2);

  input.value = valor
    .replace(".", ",")
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
}

// ==========================================
// 6. INICIALIZAÇÃO ÚNICA E EVENTOS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  gerarBanner();

  const inputsBanner = ["loja", "descricao", "precoOriginal", "precoVista", "parcelamento", "parcelado", "avaliacao"];
  inputsBanner.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        gerarBanner();
        atualizarCaixaLegenda();
      });
      el.addEventListener("change", () => {
        gerarBanner();
        atualizarCaixaLegenda();
      });
    }
  });

  const campoPrecoDe = document.getElementById("precoOriginal");
  const campoPrecoPor = document.getElementById("precoVista");

  [campoPrecoDe, campoPrecoPor].forEach((input) => {
    if (input) {
      input.addEventListener("input", () => {
        aplicarMascaraMoeda(input);
        gerarBanner();
        atualizarCaixaLegenda();
      });
    }
  });

  const todosInputs = document.querySelectorAll("input, textarea, select");
  todosInputs.forEach(input => {
    input.addEventListener("input", atualizarCaixaLegenda);
    input.addEventListener("change", atualizarCaixaLegenda);
  });

  const inputImagem = document.getElementById("imagemInput");
  if (inputImagem) {
    inputImagem.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            imagemProdutoCarregada = img;
            gerarBanner();
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const btnCopiar = document.querySelector("button[onclick*='Copiar'], button[onclick*='copiar']");
  if (btnCopiar) btnCopiar.onclick = copiarLegenda;

  const btnBaixar = document.querySelector("button[onclick*='Baixar'], button[onclick*='baixar']");
  if (btnBaixar) btnBaixar.onclick = baixarBanner;

  const btnBuscar = document.getElementById("btnBuscarML");
  if (btnBuscar) btnBuscar.onclick = buscarDadosML;

  atualizarCaixaLegenda();
});