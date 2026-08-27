// main.js
// Último script carregado pelo index.html.
//
// O que faz: garante que o array global "receitas" (declarado em
// receitas.js) não tenha títulos duplicados e fique ordenado
// alfabeticamente, ANTES de qualquer receita ser exibida na tela.
// Como: filtra duplicatas por título (mantém a primeira ocorrência) e
// ordena com localeCompare.
// Quando: roda uma única vez, na carga da página — é por isso que este
// filtro de duplicatas é o que torna seguro o merge de receitas salvas
// no localStorage feito em receitas.js (ele pode gerar duplicatas de
// título de propósito; aqui elas são removidas).
//
// Observação importante:
// → A variável 'receitas' já é declarada em receitas.js.
// → Neste arquivo (main.js) NÃO devemos redeclarar 'receitas' com let ou const.
// → Apenas usamos e manipulamos o array existente.
// → Se for necessário criar uma cópia, use outro nome (ex.: receitasFiltradas).

// Remove receitas duplicadas pelo título
receitas = receitas.filter((r, index, self) =>
    index === self.findIndex(x => x.titulo === r.titulo)
);

// Ordena receitas por título
receitas.sort((a, b) => a.titulo.localeCompare(b.titulo));

// adicionarReceita() e renderizarReceitas() foram removidas daqui: js/filtros.js
// já tem a versão correta de adicionarReceita() (que chama mostrarReceitas(),
// preservando acordeão, notas e favoritos). A versão que existia aqui usava um
// renderizarReceitas() simplificado que perdia esses recursos ao salvar uma
// nova receita, e por carregar por último, sobrescrevia a versão correta.

// exportarLista(), ordenarPorNota() e toggleAllReceitas() foram removidas
// daqui pelo mesmo motivo: já existem (e funcionam corretamente, integradas
// ao acordeão e às notas salvas no localStorage) em js/filtros.js.

