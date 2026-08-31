// firebase-config.js
// Configuração de conexão com o Firebase (Firestore) do projeto "Receitas do Papai".
//
// Por que existe: o sync.js (próximo arquivo carregado) precisa saber com qual
// projeto Firebase conversar. Essas chaves NÃO são senha — são identificadores
// públicos do projeto; quem controla o que pode ser lido/escrito são as
// "regras de segurança" do Firestore (configuradas no console do Firebase,
// em Firestore Database > Regras — veja firestore.rules neste projeto para
// o texto usado), e não este arquivo.
//
// Preenchido com os dados do projeto "receitas-do-papai" (console.firebase.google.com).
// Não incluí o measurementId (Analytics) porque o sync.js usa só o Firestore.
//
// Quando: lido pelo sync.js assim que a página carrega, para abrir a conexão.
const firebaseConfig = {
  apiKey: "AIzaSyDFXDKufNc9ykoqKc_utSSCZ9XtQs-7cSA",
  authDomain: "receitas-do-papai.firebaseapp.com",
  projectId: "receitas-do-papai",
  storageBucket: "receitas-do-papai.firebasestorage.app",
  messagingSenderId: "318639034123",
  appId: "1:318639034123:web:ed321b63bd46048b8c5c0e"
};

// Abre a conexão com o Firebase usando essas chaves. sync.js usa
// firebase.firestore() (definido por firebase-firestore-compat.js, carregado
// antes deste arquivo no index.html) para conversar com o banco.
//
// Envolvido em try/catch por segurança: se as bibliotecas do Firebase não
// carregarem (ex.: sem internet, ou o CDN gstatic.com bloqueado nessa rede),
// isso NÃO deve quebrar o resto do site — só desativa a sincronização entre
// dispositivos (sync.js detecta isso sozinho e o backup manual continua
// funcionando normalmente).
try {
  firebase.initializeApp(firebaseConfig);
} catch (erro) {
  console.error(
    "Não foi possível iniciar a conexão com o Firebase (biblioteca não " +
    "carregada?). A sincronização entre dispositivos fica desativada por " +
    "agora, mas o site continua funcionando normalmente.",
    erro
  );
}
