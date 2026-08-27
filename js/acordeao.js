// acordeao.js
// Responsável apenas por abrir/fechar detalhes de cada receita (acordeão)
// O menu lateral agora é montado exclusivamente pelo categorias.js

/**
 * Configura o comportamento de acordeão em cada receita
 * @param {HTMLElement} div - container da receita
 */
function configurarAcordeao(div) {
  const titulo = div.querySelector(".titulo");
  const detalhes = div.querySelector(".detalhes-receita");

  // Inicialmente esconde os detalhes
  detalhes.style.display = "none";

  // Alterna entre expandido/fechado ao clicar no título
  titulo.addEventListener("click", () => {
    detalhes.style.display = detalhes.style.display === "none" ? "block" : "none";
    div.classList.toggle("expandido", detalhes.style.display === "block");
    // ⚠️ não chama mostrarReceitas aqui!
  });
}

// Observação importante:
// - Este arquivo não precisa mais declarar ou construir categorias.
// - O mapa de categorias está em categorias.js.
// - O menu lateral é montado pela função montarMenuCategorias() em categorias.js.
// - Aqui cuidamos apenas da interação de abrir/fechar cada receita.
