// favoritos.js
// Responsável por gerenciar favoritos

/**
 * Lista de títulos de receitas marcadas como favoritas.
 * O que é: array de strings (título da receita), guardado no localStorage
 * sob a chave "favoritos" para persistir entre acessos.
 * Quando é usado: lido/gravado toda vez que o usuário clica na estrela de
 * favorito de uma receita, e também na hora de filtrar por "Favoritos".
 */
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

/**
 * Configura o botão de favoritar/desfavoritar dentro do card de uma receita.
 *
 * O que faz: liga o clique do botão ".favBtn" à lista de favoritos.
 * Como: se a receita ainda não está em `favoritos`, adiciona; se já está,
 * remove. Depois salva a lista atualizada no localStorage e re-renderiza
 * a tela (mantendo o filtro/busca/categoria que já estavam ativos).
 * Quando: chamado uma vez por receita, sempre que a lista é (re)renderizada
 * em mostrarReceitas() (filtros.js).
 *
 * @param {HTMLElement} div - container da receita (já tem o botão ".favBtn")
 * @param {Object} receita - objeto da receita (usa receita.titulo como chave)
 * @param {string} filtro - texto de busca ativo no momento
 * @param {string|null} categoria - categoria/subcategoria ativa no momento
 * @param {boolean} apenasFavoritos - se a visão "Favoritos" está ativa
 */
function configurarFavoritos(div, receita, filtro, categoria, apenasFavoritos) {
  const favBtn = div.querySelector(".favBtn");

  favBtn.addEventListener("click", () => {
    if (!favoritos.includes(receita.titulo)) {
      favoritos.push(receita.titulo);
    } else {
      favoritos = favoritos.filter(f => f !== receita.titulo);
    }
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    mostrarReceitas(filtro, categoria, apenasFavoritos); // atualiza lista
  });
}
