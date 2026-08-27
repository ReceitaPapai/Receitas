// menu.js
//
// ⚠️ ARQUIVO NÃO USADO ATUALMENTE — não está incluído em nenhum
// <script src="..."> do index.html.
//
// O que faz: monta um menu de categorias (parecido com montarMenuCategorias()
// em categorias.js), mas procura um elemento com id="menu" que também não
// existe no index.html atual (o menu real usa id="menuCategorias").
// Como: percorre categoriasMap e cria os itens de categoria/subcategoria.
// Quando: nunca é executado hoje, pois o arquivo não é carregado.
//
// Parece ser uma versão antiga/anterior de categorias.js. Se um dia for
// reativado, ele precisa ser ajustado para usar "menuCategorias" (não
// "menu") e ser incluído no index.html.
const menu = document.getElementById("menu");

Object.keys(categoriasMap).forEach(catKey => {
  const categoria = categoriasMap[catKey];
  
  // botão da categoria
  const catBtn = document.createElement("div");
  catBtn.className = "categoria";
  catBtn.textContent = categoria.nome;
  
  // lista de subcategorias
  const subList = document.createElement("ul");
  subList.className = "subcategorias";
  
  Object.keys(categoria.filhos).forEach(subKey => {
    const subItem = document.createElement("li");
    subItem.textContent = categoria.filhos[subKey].nome;
    subList.appendChild(subItem);
  });
  
  // toggle ao clicar
  catBtn.addEventListener("click", () => {
    const aberto = subList.style.display === "block";
    subList.style.display = aberto ? "none" : "block";
    catBtn.classList.toggle("aberto", !aberto);
  });
  
  menu.appendChild(catBtn);
  menu.appendChild(subList);
});
