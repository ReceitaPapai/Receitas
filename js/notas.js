// notas.js
// Permite dar notas às receitas

/**
 * Cria e adiciona o widget de nota (5 estrelas) no card de uma receita.
 *
 * O que faz: desenha 5 estrelas; a nota já salva (localStorage, chave
 * "nota_<titulo da receita>") define quantas ficam douradas.
 * Como: clicar numa estrela salva aquele número como a nota da receita,
 * re-renderiza a lista (mantendo filtro/busca/categoria ativos) — o que
 * também é usado por ordenarPorNota() (filtros.js) para ordenar — e envia
 * o novo estado pra nuvem (sync.js), pra essa nota aparecer também nos
 * outros dispositivos.
 * Quando: chamado uma vez por receita, sempre que a lista é (re)renderizada
 * em mostrarReceitas() (filtros.js).
 *
 * @param {HTMLElement} div - container da receita (a nota é anexada em ".detalhes-receita")
 * @param {Object} receita - objeto da receita (usa receita.titulo como chave)
 * @param {string} filtro - texto de busca ativo no momento
 * @param {string|null} categoria - categoria/subcategoria ativa no momento
 * @param {boolean} apenasFavoritos - se a visão "Favoritos" está ativa
 */
function configurarNotas(div, receita, filtro, categoria, apenasFavoritos) {
  const notaDiv = document.createElement("div");
  notaDiv.innerHTML = "<b>Nota:</b> ";
  for (let i = 1; i <= 5; i++) {
    const estrela = document.createElement("span");
    estrela.textContent = "★";
    estrela.style.cursor = "pointer";
    estrela.style.color = (localStorage.getItem("nota_" + receita.titulo) >= i) ? "gold" : "gray";
    estrela.addEventListener("click", () => {
      localStorage.setItem("nota_" + receita.titulo, i);
      mostrarReceitas(filtro, categoria, apenasFavoritos);
      if (typeof enviarParaNuvem === "function") enviarParaNuvem();
    });
    notaDiv.appendChild(estrela);
  }

  // corrigido: usa .detalhes-receita
  div.querySelector(".detalhes-receita").appendChild(notaDiv);
}
