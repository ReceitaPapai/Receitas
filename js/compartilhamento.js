// compartilhamento.js
// Permite compartilhar receita (copiar, WhatsApp, X, ou menu nativo do dispositivo)

/**
 * Cria e adiciona a barrinha de compartilhamento no card de uma receita.
 *
 * O que faz: monta o texto formatado da receita (título, ingredientes,
 * preparo, categorias e legenda) e oferece: copiar para a área de
 * transferência, abrir o WhatsApp, abrir o X (Twitter), e — quando o
 * navegador suporta (principalmente em celular) — o menu de
 * compartilhamento nativo do próprio dispositivo.
 * Como: WhatsApp e X têm links de "compartilhar" que aceitam o texto
 * pronto na própria URL (wa.me e twitter.com/intent/tweet). O Instagram
 * NÃO tem esse tipo de link — é uma limitação da própria plataforma, não
 * dá pra pré-preencher texto nele via URL. Por isso ele só aparece através
 * do botão "Mais opções" (navigator.share), que abre o menu nativo do
 * celular/navegador, o mesmo que aparece em qualquer app — normalmente
 * já lista Instagram, Mensagens, etc.
 * Quando: chamado uma vez por receita, sempre que a lista é (re)renderizada
 * em mostrarReceitas() (filtros.js).
 *
 * @param {HTMLElement} div - container da receita (a barra é anexada em ".detalhes-receita")
 * @param {Object} receita - objeto da receita (titulo, ingredientes, preparo, legenda)
 * @param {string} nomesCategorias - nomes das categorias já formatados para exibição
 */
function configurarCompartilhamento(div, receita, nomesCategorias) {
  // Corrige o bug de formatação: "ingredientes" é um array, e usar
  // ${receita.ingredientes} direto num template string chama o
  // Array.toString() padrão, que junta tudo com vírgula e SEM quebras de
  // linha. Aqui montamos uma lista de fato, uma linha por ingrediente.
  const ingredientesTexto = Array.isArray(receita.ingredientes)
    ? receita.ingredientes.map(i => "- " + i).join("\n")
    : receita.ingredientes;

  const texto =
`${receita.titulo}

Ingredientes:
${ingredientesTexto}

Preparo:
${receita.preparo}

Categorias: ${nomesCategorias}${receita.legenda ? "\n\n" + receita.legenda : ""}`;

  const shareBar = document.createElement("div");
  shareBar.className = "share-bar";

  // Copiar para a área de transferência (mantido como opção)
  const copyBtn = document.createElement("button");
  copyBtn.textContent = "📋 Copiar";
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(texto).then(() => {
      alert("Receita copiada para a área de transferência!");
    });
  });
  shareBar.appendChild(copyBtn);

  // WhatsApp — link oficial de compartilhamento com texto pronto
  const whatsLink = document.createElement("a");
  whatsLink.className = "share-link";
  whatsLink.href = "https://wa.me/?text=" + encodeURIComponent(texto);
  whatsLink.target = "_blank";
  whatsLink.rel = "noopener";
  whatsLink.textContent = "WhatsApp";
  shareBar.appendChild(whatsLink);

  // X (Twitter) — link oficial de compartilhamento com texto pronto
  const xLink = document.createElement("a");
  xLink.className = "share-link";
  xLink.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(texto);
  xLink.target = "_blank";
  xLink.rel = "noopener";
  xLink.textContent = "X";
  shareBar.appendChild(xLink);

  // Menu nativo de compartilhamento (Instagram, Mensagens, etc. quando o
  // dispositivo/navegador suportar). Só aparece quando disponível.
  if (navigator.share) {
    const nativeBtn = document.createElement("button");
    nativeBtn.textContent = "📤 Mais opções";
    nativeBtn.addEventListener("click", () => {
      navigator.share({ title: receita.titulo, text: texto }).catch(() => {});
    });
    shareBar.appendChild(nativeBtn);
  }

  div.querySelector(".detalhes-receita").appendChild(shareBar);
}
