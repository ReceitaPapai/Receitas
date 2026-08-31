// backup.js
// Permite baixar e restaurar um backup dos dados salvos pelo usuário
// (receitas adicionadas/editadas, exclusões, favoritos e notas).
//
// Por que existe: tudo isso vive só no localStorage do navegador (veja
// receitas.js e filtros.js). Se o navegador for trocado, atualizado ou
// tiver os dados de navegação limpos, esse conteúdo desaparece. Este
// arquivo permite salvar um arquivo .json fora do navegador, e trazer
// esses dados de volta a qualquer momento (nesse ou em outro dispositivo).

/**
 * Reúne todas as notas dadas às receitas (localStorage "nota_<titulo>")
 * num único objeto { "<titulo>": nota }.
 *
 * O que faz: percorre todas as chaves do localStorage e pega as que
 * começam com "nota_".
 * Quando: chamado só na hora de montar o backup (baixarBackup()).
 */
function coletarNotas() {
  const notas = {};
  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);
    if (chave.startsWith("nota_")) {
      notas[chave.slice(5)] = localStorage.getItem(chave);
    }
  }
  return notas;
}

/**
 * Gera e baixa um arquivo .json com tudo que foi salvo pelo usuário.
 *
 * O que faz: junta receitas adicionadas/editadas, receitas excluídas,
 * favoritos e notas num único arquivo, e dispara o download.
 * Como: monta um objeto, transforma em JSON e usa Blob + link temporário
 * (mesma técnica já usada em exportarLista(), filtros.js).
 * Quando: chamado pelo clique no botão "💾 Baixar Backup".
 */
function baixarBackup() {
  const backup = {
    receitasExtras: JSON.parse(localStorage.getItem("receitasExtras")) || [],
    receitasExcluidas: JSON.parse(localStorage.getItem("receitasExcluidas")) || [],
    favoritos: JSON.parse(localStorage.getItem("favoritos")) || [],
    notas: coletarNotas(),
    geradoEm: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "backup-receitas-do-papai.json";
  link.click();
}

/**
 * Restaura um backup gerado por baixarBackup().
 *
 * O que faz: lê o arquivo .json escolhido e grava seu conteúdo de volta
 * no localStorage, substituindo o que existia.
 * Como: pede confirmação (a restauração substitui os dados atuais),
 * grava cada chave, envia esse resultado pra nuvem (sync.js) — importante
 * fazer isso ANTES de recarregar, senão a sincronização buscaria de volta
 * a versão antiga que ainda estava lá e desfaria a restauração — e só
 * então recarrega a página para tudo ser aplicado.
 * Quando: chamado ao escolher um arquivo no campo "📂 Importar Backup".
 *
 * @param {File} arquivo - arquivo .json escolhido pelo usuário
 */
function restaurarBackup(arquivo) {
  if (!arquivo) return;

  const leitor = new FileReader();
  leitor.onload = (e) => {
    let backup;
    try {
      backup = JSON.parse(e.target.result);
    } catch (erro) {
      alert("Esse arquivo não parece ser um backup válido.");
      return;
    }

    if (!confirm("Isso vai substituir as receitas adicionadas, favoritos e notas atuais pelos dados do backup. Continuar?")) {
      return;
    }

    localStorage.setItem("receitasExtras", JSON.stringify(backup.receitasExtras || []));
    localStorage.setItem("receitasExcluidas", JSON.stringify(backup.receitasExcluidas || []));
    localStorage.setItem("favoritos", JSON.stringify(backup.favoritos || []));

    Object.entries(backup.notas || {}).forEach(([titulo, nota]) => {
      localStorage.setItem("nota_" + titulo, nota);
    });

    alert("Backup restaurado! A página vai recarregar agora.");
    if (typeof enviarParaNuvem === "function") {
      enviarParaNuvem().finally(() => location.reload());
    } else {
      location.reload();
    }
  };
  leitor.readAsText(arquivo);
}
