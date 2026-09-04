
// filtros.js
// Responsável por mostrar receitas, aplicar filtros e ordenação

// Ordena inicialmente por título
receitas.sort((a, b) => a.titulo.localeCompare(b.titulo));

/**
 * Guarda os parâmetros da ÚLTIMA chamada "de verdade" a mostrarReceitas()
 * (ou seja, com busca/categoria/favoritos escolhidos pelo usuário — uma
 * busca digitada, uma categoria clicada no menu, etc.).
 *
 * Por que existe: depois de salvar uma receita (nova ou editada),
 * concluirSalvamento() precisa redesenhar a lista — mas se chamar
 * mostrarReceitas() sem argumentos, ela volta pros valores padrão
 * (sem busca, sem categoria, sem "só favoritos"), fazendo a tela pular
 * pra lista completa, do zero. Pra quem estava filtrando por uma
 * categoria ou com uma busca digitada, isso parecia que a receita editada
 * "sumiu" ou "não salvou" — na real os dados estavam certos, só a tela
 * mostrava outra visão (sem esse filtro) no momento em que o usuário olhou.
 * Guardando aqui o último filtro realmente usado, concluirSalvamento()
 * consegue re-mostrar a MESMA busca/categoria/favoritos de antes de abrir
 * o formulário, em vez de resetar tudo.
 */
let ultimoFiltroUsado = { filtro: "", categoria: null, apenasFavoritos: false };

/**
 * Função principal para renderizar receitas na tela
 * @param {string} filtro - texto de busca por ingredientes
 * @param {string|null} categoria - categoria ou subcategoria selecionada
 * @param {boolean} apenasFavoritos - se true, mostra só favoritos
 */
function mostrarReceitas(filtro = "", categoria = null, apenasFavoritos = false) {
  // Lembra este filtro para concluirSalvamento() poder restaurá-lo depois
  // (veja o comentário de ultimoFiltroUsado acima).
  ultimoFiltroUsado = { filtro, categoria, apenasFavoritos };

  // Container correto é "listaReceitas"
  const lista = document.getElementById("listaReceitas");
  lista.innerHTML = "";

  // Prepara filtro de ingredientes
  const ingredientesFiltro = filtro
    .split(",")
    .map(f => f.trim().toLowerCase())
    .filter(f => f);

  receitas
    .filter(r => {
      // Se não houver filtro de ingredientes, mostra todas
      if (ingredientesFiltro.length === 0) return true;

      const textoIngredientes = Array.isArray(r.ingredientes)
        ? r.ingredientes.join(" ").toLowerCase()
        : r.ingredientes.toLowerCase();

      // Só mantém receitas que contêm todos os termos buscados
      return ingredientesFiltro.every(f => textoIngredientes.includes(f));
    })
    .filter(r => 
      !categoria || 
      r.categoria === categoria || 
      (Array.isArray(r.categorias) && r.categorias.includes(categoria))
    )
    .filter(r => !apenasFavoritos || favoritos.includes(r.titulo))
    .forEach(r => {
      const div = document.createElement("div");
      div.className = "receita";

      // Monta nomes de categorias usando categoriasMap
      const nomesCategorias = Array.isArray(r.categorias)
        ? r.categorias.map(c => categoriasMap[c] ? categoriasMap[c].nome : c).join(", ")
        : (categoriasMap[r.categoria] ? categoriasMap[r.categoria].nome : r.categoria);

      const isFav = favoritos.includes(r.titulo);

      // Renderiza HTML da receita
      div.innerHTML = `
        <div class="titulo">${r.titulo}</div>
        <div class="detalhes-receita">
          ${r.imagem ? `<img src="${r.imagem.startsWith("data:") ? r.imagem : "imagens/" + r.imagem}" alt="${r.titulo}">` : ""}
          ${r.legenda ? `<div class="legenda">${r.legenda}</div>` : ""}
          <div><b>Ingredientes:</b><br>${Array.isArray(r.ingredientes) ? r.ingredientes.join("<br>") : r.ingredientes}</div>
          <div><b>Preparo:</b><br>${r.preparo}</div>
          <div><b>Categorias:</b> ${nomesCategorias}</div>
          <button class="favBtn">${isFav ? "★ Remover Favorito" : "☆ Favorito"}</button>
          <button class="editarBtn">✏️ Editar</button>
          <button class="excluirBtn">🗑️ Excluir</button>
        </div>
      `;
      lista.appendChild(div);

      // Botões de editar/excluir (usam o título como identificador da receita)
      div.querySelector(".editarBtn").addEventListener("click", () => editarReceita(r.titulo));
      div.querySelector(".excluirBtn").addEventListener("click", () => excluirReceita(r.titulo, filtro, categoria, apenasFavoritos));

      // Conecta módulos específicos
      configurarAcordeao(div);
      configurarLightbox(div);
      configurarFavoritos(div, r, filtro, categoria, apenasFavoritos);
      configurarNotas(div, r, filtro, categoria, apenasFavoritos);
      configurarCompartilhamento(div, r, nomesCategorias);
    });
}

/**
 * Expande ou recolhe os detalhes de todas as receitas visíveis de uma vez.
 *
 * O que faz: mostra ou esconde a área ".detalhes-receita" de cada card.
 * Como: verifica se alguma receita já está aberta — se sim, fecha todas;
 * se não, abre todas.
 * Quando: chamado pelo clique no botão "Expandir/Fechar Todas".
 */
function toggleAllReceitas() {
  const lista = document.getElementById("listaReceitas");
  const detalhes = lista.querySelectorAll(".detalhes-receita");
  const algumAberto = Array.from(detalhes).some(d => d.style.display === "block");
  detalhes.forEach(d => d.style.display = algumAberto ? "none" : "block");
}

/**
 * Fecha o modal do lightbox (imagem ampliada).
 *
 * O que faz: esconde o container #lightbox.
 * Como: define display "none" diretamente.
 * Quando: chamado pelo botão "Fechar" dentro do lightbox.
 */
function fecharLightbox() {
  document.getElementById("lightbox").style.display = "none";
}

/**
 * Exporta, como arquivo .txt, a lista das receitas atualmente visíveis na tela.
 *
 * O que faz: pega os títulos que estão sendo mostrados no momento
 * (respeitando busca/categoria/favoritos já aplicados) e gera um download.
 * Como: monta um texto simples e usa Blob + link temporário para disparar
 * o download do navegador.
 * Quando: chamado pelo clique no botão "Exportar Lista".
 */
function exportarLista() {
  const receitasVisiveis = document.querySelectorAll(".receita .titulo");
  let texto = "Receitas filtradas:\n\n";
  receitasVisiveis.forEach(t => texto += "- " + t.textContent + "\n");

  const blob = new Blob([texto], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "receitas-filtradas.txt";
  link.click();
}

/**
 * Controla qual receita está sendo editada no momento.
 * O que é: null quando o formulário está no modo "nova receita"; o
 * título da receita quando está no modo "editar".
 * Quando muda: editarReceita() define; salvarReceitaFormulario() e
 * fecharFormularioReceita() voltam para null.
 */
let receitaEmEdicaoTitulo = null;

/**
 * Limpa todos os campos do formulário de receita.
 *
 * O que faz: esvazia título, ingredientes, preparo, categoria, imagem e
 * legenda.
 * Como: acessa cada campo pelo id e reseta seu valor.
 * Quando: chamado ao abrir o formulário para uma NOVA receita, e depois
 * de salvar com sucesso (nova ou edição).
 */
function limparFormularioReceita() {
  document.getElementById("novoTitulo").value = "";
  document.getElementById("novoIngredientes").value = "";
  document.getElementById("novoPreparo").value = "";
  document.getElementById("novoCategoria").selectedIndex = 0;
  document.getElementById("novoImagem").value = "";
  document.getElementById("novoLegenda").value = "";
}

/**
 * Abre o formulário para cadastrar uma NOVA receita (do zero).
 *
 * O que faz: garante que o formulário não está em modo de edição, limpa
 * os campos e torna a seção #formularioReceita visível.
 * Quando: chamado pelo clique no botão "➕ Nova Receita".
 */
function abrirFormularioReceita() {
  receitaEmEdicaoTitulo = null;
  limparFormularioReceita();
  document.getElementById("formularioReceita").style.display = "block";
}

/**
 * Fecha o formulário de receita (nova ou edição).
 *
 * O que faz: esconde a seção #formularioReceita e sai do modo de edição.
 * Quando: chamado ao clicar em "Cancelar" ou após salvar com sucesso.
 */
function fecharFormularioReceita() {
  document.getElementById("formularioReceita").style.display = "none";
  receitaEmEdicaoTitulo = null;
}

/**
 * Abre o formulário já preenchido com os dados de uma receita existente.
 *
 * O que faz: localiza a receita pelo título e copia seus dados para os
 * campos do formulário.
 * Como: título, ingredientes (juntados por vírgula), preparo, categoria
 * e legenda são preenchidos normalmente. A foto NÃO é pré-preenchida no
 * campo de arquivo (navegadores não permitem isso por segurança) — se
 * você não escolher uma foto nova, a foto atual é mantida.
 * Quando: chamado pelo clique no botão "✏️ Editar" de uma receita.
 *
 * @param {string} titulo - título da receita a editar
 */
function editarReceita(titulo) {
  const receita = receitas.find(r => r.titulo === titulo);
  if (!receita) return;

  receitaEmEdicaoTitulo = titulo;

  document.getElementById("novoTitulo").value = receita.titulo;
  document.getElementById("novoIngredientes").value = Array.isArray(receita.ingredientes)
    ? receita.ingredientes.join(", ")
    : receita.ingredientes;
  document.getElementById("novoPreparo").value = receita.preparo;
  document.getElementById("novoCategoria").value = receita.categoria;
  document.getElementById("novoImagem").value = "";
  document.getElementById("novoLegenda").value = receita.legenda || "";

  document.getElementById("formularioReceita").style.display = "block";
}

/**
 * Exclui uma receita definitivamente (não pode ser desfeito).
 *
 * O que faz: pede confirmação, remove a receita da tela e garante que
 * ela não volte a aparecer, mesmo após recarregar a página.
 * Como: tira a receita do array "receitas", registra o título numa
 * lista de exclusões (localStorage "receitasExcluidas") — necessário
 * porque receitas.js sempre recarrega o banco original inteiro, então
 * sem essa lista a receita "ressuscitaria" no próximo F5 — e também a
 * remove de "receitasExtras", caso tenha sido adicionada/editada por
 * aqui antes. Por fim, envia o novo estado pra nuvem (sync.js), pra essa
 * exclusão aparecer também nos outros dispositivos.
 * Quando: chamado pelo clique no botão "🗑️ Excluir" de uma receita.
 *
 * @param {string} titulo - título da receita a excluir
 * @param {string} filtro - texto de busca ativo no momento (para re-renderizar mantendo o filtro)
 * @param {string|null} categoria - categoria ativa no momento
 * @param {boolean} apenasFavoritos - se a visão "Favoritos" está ativa
 */
function excluirReceita(titulo, filtro, categoria, apenasFavoritos) {
  if (!confirm(`Excluir "${titulo}"? Essa ação não pode ser desfeita.`)) return;

  receitas = receitas.filter(r => r.titulo !== titulo);

  const excluidas = JSON.parse(localStorage.getItem("receitasExcluidas")) || [];
  if (!excluidas.includes(titulo)) {
    excluidas.push(titulo);
    localStorage.setItem("receitasExcluidas", JSON.stringify(excluidas));
  }

  const extras = JSON.parse(localStorage.getItem("receitasExtras")) || [];
  localStorage.setItem("receitasExtras", JSON.stringify(extras.filter(r => r.titulo !== titulo)));

  mostrarReceitas(filtro, categoria, apenasFavoritos);
  if (typeof enviarParaNuvem === "function") enviarParaNuvem();
}

/**
 * Redimensiona e comprime uma foto antes de guardá-la na receita.
 *
 * O que faz: recebe o arquivo de foto escolhido no formulário e devolve
 * uma versão menor, pronta para caber com folga no localStorage.
 * Como: desenha a foto num <canvas> já reduzida (largura máxima de
 * 800px, mantendo a proporção) e exporta como JPEG com qualidade 80% —
 * suficiente pra ficar nítida no card, mas muito mais leve que a foto
 * original de um celular (que pode vir com vários MB).
 * Quando: chamado por salvarReceitaFormulario() sempre que uma foto nova
 * é escolhida.
 *
 * @param {File} arquivo - arquivo de imagem escolhido pelo usuário
 * @param {number} larguraMaxima - largura máxima da imagem final, em pixels
 * @param {number} qualidade - qualidade do JPEG exportado (0 a 1)
 * @returns {Promise<string>} data URL da imagem já comprimida
 */
function comprimirImagem(arquivo, larguraMaxima = 800, qualidade = 0.8) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, larguraMaxima / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", qualidade));
      };
      img.onerror = () => reject(new Error("Não foi possível ler a imagem."));
      img.src = e.target.result;
    };
    leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    leitor.readAsDataURL(arquivo);
  });
}

/**
 * Salva o formulário de receita — cria uma nova ou atualiza uma existente.
 *
 * O que faz: valida os campos obrigatórios, lê a foto escolhida (se
 * houver) e grava a receita.
 * Como: se uma foto foi escolhida no campo de arquivo, ela é convertida
 * para uma imagem embutida (data URL) via FileReader — por isso não
 * depende mais de nomear arquivos dentro da pasta imagens/. Se nenhuma
 * foto nova foi escolhida e estamos editando, mantém a foto que a
 * receita já tinha. Se `receitaEmEdicaoTitulo` estiver definido,
 * substitui aquela receita; senão, adiciona uma nova. Ao final, guarda a
 * receita em "receitasExtras" (localStorage) — é isso que faz ela
 * sobreviver a um F5 (receitas.js relê essa chave ao carregar). Por fim,
 * envia o novo estado pra nuvem (sync.js), pra essa receita aparecer
 * também nos outros dispositivos.
 * Quando: chamado pelo clique no botão "Salvar Receita" do formulário.
 */
function salvarReceitaFormulario() {
  const titulo = document.getElementById("novoTitulo").value.trim();
  const ingredientes = document.getElementById("novoIngredientes").value.split(",").map(i => i.trim());
  const preparo = document.getElementById("novoPreparo").value.trim();
  const categoria = document.getElementById("novoCategoria").value.trim();
  const legenda = document.getElementById("novoLegenda").value.trim();
  const arquivoImagem = document.getElementById("novoImagem").files[0];

  if (!titulo || ingredientes.length === 0 || !preparo) {
    alert("Preencha pelo menos título, ingredientes e preparo.");
    return;
  }

  const tituloAntigo = receitaEmEdicaoTitulo;
  const receitaAntiga = tituloAntigo ? receitas.find(r => r.titulo === tituloAntigo) : null;

  function concluirSalvamento(imagemValor) {
    const novaReceita = { titulo, ingredientes, preparo, categoria, imagem: imagemValor, legenda };

    if (tituloAntigo) {
      receitas = receitas.map(r => r.titulo === tituloAntigo ? novaReceita : r);
    } else {
      receitas.push(novaReceita);
    }
    receitas.sort((a, b) => a.titulo.localeCompare(b.titulo));

    // Guarda a receita em "receitasExtras" (substitui se já existia lá com o título antigo/novo)
    let extras = JSON.parse(localStorage.getItem("receitasExtras")) || [];
    extras = extras.filter(r => r.titulo !== tituloAntigo && r.titulo !== titulo);
    extras.push(novaReceita);
    localStorage.setItem("receitasExtras", JSON.stringify(extras));

    // CORREÇÃO: antes chamava mostrarReceitas() sem argumentos, o que
    // resetava busca/categoria/favoritos e mostrava a lista completa do
    // zero — dava a impressão de que a receita salva "não aparecia"
    // quando, na verdade, os dados estavam certos e só a tela tinha
    // pulado para outra visão (sem o filtro que estava ativo antes de
    // abrir o formulário). Usando ultimoFiltroUsado (guardado em
    // mostrarReceitas(), ver comentário lá em cima), a lista volta a
    // mostrar a MESMA busca/categoria/favoritos de antes de editar.
    mostrarReceitas(ultimoFiltroUsado.filtro, ultimoFiltroUsado.categoria, ultimoFiltroUsado.apenasFavoritos);
    fecharFormularioReceita();
    limparFormularioReceita();
    if (typeof enviarParaNuvem === "function") enviarParaNuvem();
  }

  if (arquivoImagem) {
    comprimirImagem(arquivoImagem)
      .then(concluirSalvamento)
      .catch(() => alert("Não foi possível processar essa foto. Tente outra."));
  } else {
    concluirSalvamento(receitaAntiga ? receitaAntiga.imagem : "");
  }
}

/**
 * Ordena as receitas pela nota dada pelo usuário (maior nota primeiro).
 *
 * O que faz: reordena o array "receitas" usando a nota salva por título.
 * Como: lê "nota_<titulo>" do localStorage (mesma chave usada em notas.js);
 * receitas sem nota contam como 0. Depois re-renderiza mantendo a busca
 * que estiver digitada no campo #busca.
 * Quando: chamado pelo clique no botão "Ordenar por Nota".
 */
function ordenarPorNota() {
  receitas.sort((a, b) => {
    const notaA = parseInt(localStorage.getItem("nota_" + a.titulo)) || 0;
    const notaB = parseInt(localStorage.getItem("nota_" + b.titulo)) || 0;
    return notaB - notaA;
  });
  mostrarReceitas(document.getElementById("busca")?.value || "");
}
