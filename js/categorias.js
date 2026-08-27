
// categorias.js
// Estrutura hierárquica de categorias e subcategorias

/**
 * Mapa fixo de categorias e subcategorias do site.
 * O que é: cada chave (ex.: "1") é uma categoria principal, com um "nome"
 * de exibição e um objeto "filhos" com as subcategorias (ex.: "1.1").
 * Quando é usado: o código da subcategoria (ex.: "1.1") é o mesmo valor
 * guardado em receita.categoria — é como o filtro (mostrarReceitas) sabe
 * quais receitas pertencem a qual subcategoria.
 */
const categoriasMap = {
  "1": { nome: "1 - Pizzas", filhos: {
    "1.1": { nome: "1 - Clássicas" },
    "1.2": { nome: "2 - Com Carne" },
    "1.3": { nome: "3 - Vegetariana" },
    "1.4": { nome: "4 - Especiais" },
    "1.5": { nome: "5 - Doces" }
  }},
  "2": { nome: "2 - Sobremesas", filhos: {
    "2.1": { nome: "1 - Bolos" },
    "2.2": { nome: "2 - Pudins" },
    "2.3": { nome: "3 - Cremes" },
    "2.4": { nome: "4 - Diet" },
    "2.5": { nome: "5 - Tortas Doces" },
    "2.6": { nome: "6 - Docinhos" }
  }},
  "3": { nome: "3 - Comidas", filhos: {
    "3.1": { nome: "1 - Massas" },
    "3.2": { nome: "2 - Molhos" },
    "3.3": { nome: "3 - Carnes" },
    "3.4": { nome: "4 - Sopas" },
    "3.5": { nome: "5 - Entradas" },
    "3.6": { nome: "6 - Acompanhamentos" },
    "3.7": { nome: "7 - Prato Principal" }
  }},
  "4": { nome: "4 - Especiais", filhos: {
    "4.1": { nome: "1 - Delícias" }
  }},
  "5": { nome: "5 - Massas", filhos: {
    "5.1": { nome: "1 - Pizza" },
    "5.2": { nome: "2 - Pães" },
    "5.3": { nome: "3 - Doces" },
    "5.4": { nome: "4 - Pastel" }
  }},
  "6": { nome: "6 - Bebidas", filhos: {
    "6.1": { nome: "1 - Sucos" },
    "6.2": { nome: "2 - Vitaminas" },
    "6.3": { nome: "3 - Drinks" },
    "6.4": { nome: "4 - Especiais" }
  }},
  "7": { nome: "7 - Salgados", filhos: {
    "7.1": { nome: "1 - Pastéis" },
    "7.2": { nome: "2 - Empadas" },
    "7.3": { nome: "3 - Tortas Salgadas" },
    "7.4": { nome: "4 - Especiais" }
  }}
};

// -----------------------------
// Função para montar menu lateral
// -----------------------------
/**
 * Monta o menu lateral de categorias (sidebar).
 *
 * O que faz: cria, para cada categoria de categoriasMap, um item clicável
 * que expande/recolhe suas subcategorias, além dos itens fixos "Todas as
 * Receitas" e "Favoritos".
 * Como: clicar numa categoria só expande/recolhe a lista (não filtra
 * nada); clicar numa SUBcategoria é que chama mostrarReceitas("", código)
 * para filtrar de fato. "Todas as Receitas" e "Favoritos" chamam
 * mostrarReceitas() sem filtro de categoria.
 * Quando: chamado uma vez, ao carregar a página.
 */
function montarMenuCategorias() {
  const menu = document.getElementById("menuCategorias");
  menu.innerHTML = "";

  Object.entries(categoriasMap).forEach(([codigo, cat]) => {
    // botão da categoria principal
    const catBtn = document.createElement("li");
    catBtn.className = "categoria";
    catBtn.textContent = "▶ " + cat.nome;

    // lista de subcategorias
    const subList = document.createElement("ul");
    subList.className = "subcategorias";
    subList.style.display = "none";

    Object.entries(cat.filhos).forEach(([subCodigo, subCat]) => {
      const subItem = document.createElement("li");
      subItem.textContent = subCat.nome;

      subItem.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".subcategorias li").forEach(li => li.classList.remove("ativo"));
        subItem.classList.add("ativo");
        mostrarReceitas("", subCodigo);
      });

      subList.appendChild(subItem);
    });

    // toggle ao clicar na categoria
    catBtn.addEventListener("click", () => {
      const aberto = subList.style.display === "block";
      subList.style.display = aberto ? "none" : "block";
      catBtn.textContent = (aberto ? "▶ " : "▼ ") + cat.nome;
    });

    menu.appendChild(catBtn);
    menu.appendChild(subList);
  });

  // Botão "Todas as Receitas"
  const allLi = document.createElement("li");
  allLi.textContent = "📖 Todas as Receitas";
  allLi.addEventListener("click", () => {
    mostrarReceitas("", null, false);
  });
  menu.appendChild(allLi);

  // Botão "Favoritos"
  const favLi = document.createElement("li");
  favLi.textContent = "⭐ Favoritos";
  favLi.addEventListener("click", () => {
    mostrarReceitas("", null, true);
  });
  menu.appendChild(favLi);
}

/**
 * Preenche o <select id="novoCategoria"> do formulário "Nova Receita"
 * com as subcategorias reais de categoriasMap.
 *
 * O que faz: monta uma option por subcategoria, usando o código
 * (ex.: "1.1") como value — o mesmo código que o filtro do menu lateral
 * usa para comparar r.categoria.
 * Como: percorre categoriasMap (categoria -> filhos) e cria as options.
 * Quando: uma vez, ao carregar a página, junto com montarMenuCategorias().
 */
function montarSelectCategorias() {
  const select = document.getElementById("novoCategoria");
  if (!select) return;

  select.innerHTML = "";

  Object.entries(categoriasMap).forEach(([codigo, cat]) => {
    Object.entries(cat.filhos).forEach(([subCodigo, subCat]) => {
      const option = document.createElement("option");
      option.value = subCodigo;
      option.textContent = `${cat.nome} > ${subCat.nome}`;
      select.appendChild(option);
    });
  });
}
