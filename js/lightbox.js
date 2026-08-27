// lightbox.js
// Responsável por abrir imagens em tela cheia (modal lightbox)

/**
 * Configura o lightbox para uma receita
 * @param {HTMLElement} div - container da receita
 */
function configurarLightbox(div) {
  // procura a imagem dentro da receita
  const img = div.querySelector(".detalhes-receita img");
  if (!img) return; // se não houver imagem, não faz nada

  img.style.cursor = "pointer"; // indica que é clicável

  img.addEventListener("click", () => {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");

    if (!lightbox || !lightboxImg) {
      console.error("Lightbox container não encontrado no HTML.");
      return;
    }

    // define a imagem ampliada
    lightboxImg.src = img.src;
    lightbox.style.display = "flex"; // mostra o modal
  });
}

/**
 * Fecha o lightbox
 */
function fecharLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    lightbox.style.display = "none";
  }
}

