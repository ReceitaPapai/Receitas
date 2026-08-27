// converter.js
// converter.js
//
// ⚠️ ARQUIVO NÃO USADO PELO SITE — não está incluído em nenhum
// <script src="..."> do index.html, e não poderia estar: usa
// require("fs"), que só existe em Node.js, não no navegador.
//
// O que faz: é um script utilitário, feito para rodar manualmente com
// Node (ex.: "node converter.js") fora do site. Lê um arquivo de texto
// (receitas.js/receitasTxt) com receitas separadas por "###", e cada
// receita usando "---" pra separar ingredientes do preparo e "===" pra
// marcar os metadados (Categorias/Imagem/Legenda).
// Como: converte esse texto em objetos { titulo, ingredientes, preparo,
// categoria, imagem, legenda } e grava tudo em receitas.json.
// Quando: só quando alguém precisa gerar/atualizar receitas.json a partir
// de um arquivo de texto — não faz parte do fluxo do site em si.
const fs = require("fs");

// Lê o conteúdo do arquivo receitas.js
let receitasTxt = fs.readFileSync("receitas.js", "utf8");

function converterReceitas(texto) {
  // Divide cada receita pelo marcador "###"
  const blocos = texto.split("###").filter(b => b.trim() !== "");
  let receitas = blocos.map(bloco => {
    const linhas = bloco.split("\n").map(l => l.trim()).filter(l => l);

    // título = primeira linha
    const titulo = linhas[0] || "";

    // encontra separadores
    const idxSeparador = linhas.indexOf("---");
    const idxMeta = linhas.indexOf("===");

    // ingredientes = entre título e ---
    const ingredientes = idxSeparador > -1 ? linhas.slice(1, idxSeparador) : [];

    // preparo = entre --- e ===
    const preparo = (idxSeparador > -1 && idxMeta > -1)
      ? linhas.slice(idxSeparador + 1, idxMeta).join(" ")
      : "";

    // metadados = depois de ===
    const metaLinhas = idxMeta > -1 ? linhas.slice(idxMeta + 1) : [];
    const categoria = metaLinhas.find(l => l.startsWith("Categorias:"))?.replace("Categorias:", "").trim() || "";
    const imagem = metaLinhas.find(l => l.startsWith("Imagem:"))?.replace("Imagem:", "").trim() || "";
    const legenda = metaLinhas.find(l => l.startsWith("Legenda:"))?.replace("Legenda:", "").trim() || "";

    return { titulo, ingredientes, preparo, categoria, imagem, legenda };
  });

  return receitas;
}

let receitasJSON = converterReceitas(receitasTxt);

// Salva em receitas.json
fs.writeFileSync("receitas.json", JSON.stringify(receitasJSON, null, 2), "utf8");

console.log("Conversão concluída! Arquivo receitas.json gerado.");
