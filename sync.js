// sync.js
// Sincroniza os dados DESTE USUÁRIO (não o banco de receitas original) entre
// dispositivos, usando o Firestore (banco de dados do Firebase) como ponto
// de encontro — em vez de depender de baixar/importar um arquivo de backup
// na mão toda vez.
//
// Por que existe: receitas adicionadas/editadas, exclusões, favoritos e
// notas vivem só no localStorage de cada navegador (veja receitas.js,
// filtros.js, favoritos.js e notas.js). Até aqui, a única forma de levar
// isso de um aparelho pro outro era baixarBackup() / restaurarBackup()
// (backup.js), na mão. Este arquivo grava e lê essas mesmas informações
// num documento compartilhado no Firestore, e fica "escutando" esse
// documento — assim, uma receita adicionada no celular aparece sozinha no
// computador (e vice-versa), sem precisar exportar/importar nada.
//
// O que fica sincronizado (exatamente os mesmos 4 itens que já iam no
// backup manual — veja coletarDadosLocais() abaixo): receitasExtras,
// receitasExcluidas, favoritos e notas. O banco ORIGINAL de receitas
// (o array grande em receitas.js) continua fixo no código, igual sempre
// foi — não é sincronizado, porque não muda sozinho.
//
// Importante sobre segurança/privacidade: como o site é de acesso aberto
// (qualquer pessoa com o link entra, sem login), o documento do Firestore
// também precisa estar aberto para leitura E escrita (veja firestore.rules
// na raiz do projeto, e as instruções de como colar isso no console do
// Firebase). Isso foi uma escolha deliberada pela simplicidade — mas
// significa que qualquer pessoa com o link do site poderia, em teoria,
// alterar os dados sincronizados. Para o uso pretendido (família/amigos
// próximos, poucos usuários) isso foi considerado aceitável.
//
// Limite a observar: o Firestore no plano gratuito ("Spark") permite até
// 1 documento de 1 MiB — bem mais do que receitas adicionadas por aqui
// deveriam ocupar, mas se um dia isso virar um problema (ex.: muitas fotos
// grandes coladas em receitas extras), é sinal de que esse documento único
// precisaria virar vários documentos menores.
//
// Quando roda: carregado pelo index.html logo depois de receitas.js e das
// bibliotecas do Firebase (firebase-app-compat.js, firebase-firestore-compat.js,
// firebase-config.js) — mas antes dos outros arquivos do site. Isso não é
// um problema mesmo esses outros arquivos ainda não tendo rodado, porque
// tudo aqui só é USADO (chamado) depois — em resposta a um clique do
// usuário ou a uma atualização vinda da nuvem, nunca durante o carregamento
// da página em si.

/**
 * Referência para o único documento compartilhado no Firestore onde os
 * dados deste app ficam guardados. `null` se a conexão não pôde ser
 * aberta (ex.: sem internet, ou CDN do Firebase bloqueado) — nesse caso,
 * o site continua funcionando normalmente, só sem sincronizar.
 */
let referenciaNuvem = null;
try {
  referenciaNuvem = firebase.firestore().collection("dados").doc("compartilhado");
} catch (erro) {
  console.error(
    "Não foi possível conectar à nuvem (Firebase). A sincronização entre " +
    "dispositivos fica desativada por agora, mas o site continua funcionando " +
    "normalmente — o backup manual (💾 Baixar Backup / 📂 Importar Backup) " +
    "continua disponível.",
    erro
  );
}

/**
 * true enquanto estamos aplicando dados QUE ACABARAM DE CHEGAR da nuvem.
 * Existe para o próprio aplicarDadosDaNuvem() não disparar um envio de
 * volta pra nuvem (o que criaria um vaivém sem necessidade — embora não um
 * loop infinito, já que os dados seriam idênticos e enviarParaNuvem()
 * também compara antes de fazer qualquer coisa).
 */
let sincronizandoDaNuvem = false;

/**
 * Reúne os 4 itens sincronizados, lendo diretamente do localStorage — no
 * mesmo formato que backup.js já usa em baixarBackup()/restaurarBackup().
 *
 * O que faz: monta um objeto { receitasExtras, receitasExcluidas,
 * favoritos, notas }.
 * Quando: usado por enviarParaNuvem() (pra saber o que mandar) e por
 * aplicarDadosDaNuvem() (pra comparar com o que chegou da nuvem).
 */
function coletarDadosLocais() {
  return {
    receitasExtras: JSON.parse(localStorage.getItem("receitasExtras")) || [],
    receitasExcluidas: JSON.parse(localStorage.getItem("receitasExcluidas")) || [],
    favoritos: JSON.parse(localStorage.getItem("favoritos")) || [],
    notas: coletarNotas() // função já existe em backup.js
  };
}

/**
 * Envia para o Firestore o estado atual (o que este dispositivo tem agora
 * no localStorage).
 *
 * O que faz: sobrescreve o documento compartilhado com os dados de agora.
 * Como: usa .set() (substitui o documento inteiro) — mais simples que
 * mesclar campo a campo, e correto aqui porque cada dispositivo sempre
 * manda o estado COMPLETO dos 4 itens, não só o que mudou.
 * Quando: chamado depois de qualquer ação que grava algo no localStorage —
 * ver chamadas em filtros.js (salvar/excluir receita), favoritos.js
 * (favoritar/desfavoritar), notas.js (dar nota) e backup.js
 * (restaurar um backup importado).
 *
 * @returns {Promise} resolve quando a escrita chega ao servidor (ou já
 *   resolve na hora, sem fazer nada, se a conexão com a nuvem não existe).
 */
function enviarParaNuvem() {
  if (!referenciaNuvem || sincronizandoDaNuvem) return Promise.resolve();

  const dados = coletarDadosLocais();
  dados.atualizadoEm = new Date().toISOString(); // só informativo, não é usado pra decidir nada

  return referenciaNuvem.set(dados).catch(erro => {
    console.error("Não foi possível sincronizar com a nuvem:", erro);
  });
}

/**
 * Aplica no localStorage deste dispositivo um estado que chegou da nuvem,
 * e recarrega a página para tudo (a lista de receitas, favoritos, notas)
 * refletir o que chegou.
 *
 * O que faz: primeiro compara o que chegou com o que este dispositivo já
 * tem — se for igual, não faz nada (evita recarregar a página à toa,
 * inclusive evitando um vaivém com enviarParaNuvem()). Se for diferente,
 * grava tudo no localStorage e dá location.reload() — igual
 * restaurarBackup() já faz em backup.js, mesmo padrão.
 * Como: sabemos que essa mudança já veio "confirmada" pelo Firestore (não
 * é um eco da nossa própria escrita) porque quem chama esta função already
 * checou snapshot.metadata.hasPendingWrites antes.
 * Quando: chamado pelo listener no fim deste arquivo, sempre que o
 * documento compartilhado muda no Firestore (por este dispositivo ou por
 * qualquer outro).
 *
 * @param {Object} dados - o mesmo formato de coletarDadosLocais()
 */
function aplicarDadosDaNuvem(dados) {
  const normalizado = {
    receitasExtras: dados.receitasExtras || [],
    receitasExcluidas: dados.receitasExcluidas || [],
    favoritos: dados.favoritos || [],
    notas: dados.notas || {}
  };

  if (JSON.stringify(normalizado) === JSON.stringify(coletarDadosLocais())) {
    return; // nada realmente mudou (ex.: eco da nossa própria escrita já confirmada)
  }

  sincronizandoDaNuvem = true;
  localStorage.setItem("receitasExtras", JSON.stringify(normalizado.receitasExtras));
  localStorage.setItem("receitasExcluidas", JSON.stringify(normalizado.receitasExcluidas));
  localStorage.setItem("favoritos", JSON.stringify(normalizado.favoritos));
  Object.entries(normalizado.notas).forEach(([titulo, nota]) => {
    localStorage.setItem("nota_" + titulo, nota);
  });

  location.reload();
}

// Escuta o documento compartilhado em tempo real. onSnapshot chama esta
// função assim que a página abre (com o que já estiver salvo), e de novo
// toda vez que o documento mudar — inclusive quando a mudança foi deste
// próprio dispositivo (por isso o cuidado com hasPendingWrites abaixo).
if (referenciaNuvem) {
  referenciaNuvem.onSnapshot(
    snapshot => {
      // hasPendingWrites = true: esta atualização é a NOSSA PRÓPRIA escrita
      // ainda não confirmada pelo servidor (eco local do enviarParaNuvem()).
      // Ignoramos aqui; quando o servidor confirmar, o snapshot chega de
      // novo com hasPendingWrites = false.
      if (snapshot.metadata.hasPendingWrites) return;

      if (!snapshot.exists) {
        // Ainda não existe nada na nuvem (primeiro uso do projeto Firebase):
        // sobe o que este dispositivo já tem localmente, virando a base inicial.
        enviarParaNuvem();
        return;
      }

      aplicarDadosDaNuvem(snapshot.data());
    },
    erro => {
      console.error(
        "Não foi possível receber atualizações da nuvem. A sincronização " +
        "fica pausada até a próxima vez que a página carregar, mas os dados " +
        "locais deste dispositivo continuam intactos.",
        erro
      );
    }
  );
}
