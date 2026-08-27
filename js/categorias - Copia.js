// categorias.js
// Estrutura hierárquica de categorias e subcategorias

const categoriasMap = {
  "1": { nome: "Pizzas", filhos: {
    "1.1": { nome: "Classicas" },
    "1.2": { nome: "Com Carne" },
    "1.3": { nome: "Vegetariana" },
    "1.4": { nome: "Especiais" },
    "1.5": { nome: "Doces" }
  }},
  "2": { nome: "Sobremesas", filhos: {
    "2.1": { nome: "Bolos" },
    "2.2": { nome: "Pudins" },
    "2.3": { nome: "Cremes" },
    "2.4": { nome: "Diet" },
    "2.5": { nome: "Tortas Doces" },
    "2.6": { nome: "Docinhos" }
    }},
  "3": { nome: "Comidas", filhos: {
    "3.1": { nome: "Massas" },
    "3.2": { nome: "Molhos" },
    "3.3": { nome: "Carnes" },
    "3.4": { nome: "Sopa" },
    "3.5": { nome: "Entradas" },
    "3.6": { nome: "Acompanhamentos" },
    "3.7": { nome: "Prato Principal" }
  }},
  "4": { nome: "Especiais", filhos: {
    "4.1": { nome: "Delicias" }
  }},
  "5": { nome: "Massas", filhos: {
    "5.1": { nome: "Pizza" },
    "5.2": { nome: "Pães" },
    "5.3": { nome: "Doces" },
    "5.4": { nome: "Pastel" }
  }},
  "6": { nome: "Bebidas", filhos: {
    "6.1": { nome: "Sucos" },
    "6.2": { nome: "Vitaminas" },
    "6.3": { nome: "Drinks" },
    "6.4": { nome: "Especiais" }
  }},

  "7": { nome: "Salgados", filhos: {
    "7.1": { nome: "Pastéis" },
    "7.2": { nome: "Empadas" },
    "7.3": { nome: "Tortas Salgadas" },
    "7.4": { nome: "Especiais" }
  }}







};


// Função para montar menu lateral
function montarMenuCategorias() {
  const menu = document.getElementById("menuCategorias");
  menu.innerHTML = "";

  Object.entries(categoriasMap).forEach(([codigo, cat]) => {
    const li = document.createElement("li");
    li.textContent = cat.nome;
    li.dataset.cat = codigo;
    menu.appendChild(li);

    li.addEventListener("click", () => {
      mostrarReceitas(document.getElementById("busca").value, codigo);
    });

    // Se tiver subcategorias, cria uma lista interna
    if (cat.filhos) {
      const ulSub = document.createElement("ul");
      ulSub.style.marginLeft = "15px";
      Object.entries(cat.filhos).forEach(([subCodigo, subCat]) => {
        const subLi = document.createElement("li");
        subLi.textContent = subCat.nome;
        subLi.dataset.cat = subCodigo;
        ulSub.appendChild(subLi);

        subLi.addEventListener("click", () => {
          mostrarReceitas(document.getElementById("busca").value, subCodigo);
        });
      });
      menu.appendChild(ulSub);
    }
  });

// Botão "Todas as Receitas"
const allLi = document.createElement("li");
allLi.textContent = "📖 Todas as Receitas";
allLi.addEventListener("click", () => {
  // Chama sem filtro, sem categoria e sem favoritos
  mostrarReceitas("", null, false);
});
menu.appendChild(allLi);



  // Adiciona opção Favoritos
  const favLi = document.createElement("li");
  favLi.textContent = "⭐ Favoritos";
  favLi.addEventListener("click", () => {
    mostrarReceitas(document.getElementById("busca").value, null, true);
  });
  menu.appendChild(favLi);
}
