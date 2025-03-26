// Configuração do Firebase
const firebaseConfig = {
    apiKey: document.querySelector('meta[name="firebase-api-key"]').getAttribute('content'),
    authDomain: document.querySelector('meta[name="firebase-auth-domain"]').getAttribute('content'),
    projectId: document.querySelector('meta[name="firebase-project-id"]').getAttribute('content'),
    storageBucket: document.querySelector('meta[name="firebase-storage-bucket"]').getAttribute('content'),
    messagingSenderId: document.querySelector('meta[name="firebase-messaging-sender-id"]').getAttribute('content'),
    appId: document.querySelector('meta[name="firebase-app-id"]').getAttribute('content'),
    measurementId: document.querySelector('meta[name="firebase-measurement-id"]').getAttribute('content')
  };
  
  // Inicialização do Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore(app); // Acessando o Firestore
  const analytics = firebase.analytics(app); // Acessando o Analytics

let totalRifas = 100;
let participantes = [];
let selecionadas = [];

// Função para gerar número da rifa
function gerarNumeroRifa() {
  if (selecionadas.length === 0) {
    alert("Nenhuma rifa selecionada!");
    return null;
  }
  return selecionadas.pop();
}

// Função para gerar a tabela de rifas
function gerarTabelaRifas() {
  let rifasOcupadas = participantes.map(p => p.numeroRifa);
  let tabela = document.getElementById("tabelaRifas");
  tabela.innerHTML = "";

  let colunas = 10; // Define o número de colunas por linha
  let linha;

  for (let i = 1; i <= totalRifas; i++) {
    if ((i - 1) % colunas === 0) {
      linha = document.createElement("tr");
      tabela.appendChild(linha);
    }

    let celula = document.createElement("td");
    celula.textContent = i;
    celula.classList.add(rifasOcupadas.includes(i) ? "comprada" : "disponivel");

    // Adiciona evento de clique para selecionar rifas disponíveis
    if (!rifasOcupadas.includes(i)) {
      celula.addEventListener("click", () => selecionarRifa(i, celula));
    }

    linha.appendChild(celula);
  }
}

// Função para selecionar uma rifa
function selecionarRifa(numero, celula) {
  let index = selecionadas.indexOf(numero);
  if (index === -1) {
    selecionadas.push(numero);
    celula.classList.add("selecionado");
  } else {
    selecionadas.splice(index, 1);
    celula.classList.remove("selecionado");
  }
}

// Função para confirmar compra
function confirmarCompra() {
  const nome = document.getElementById('nome').value;
  const telefone = document.getElementById('telefone').value;
  const endereco = document.getElementById('endereco').value;

  if (!nome || !telefone || !endereco) {
    alert("Por favor, preencha todos os campos do participante.");
    return;
  }

  if (selecionadas.length === 0) {
    alert("Nenhuma rifa selecionada!");
    return;
  }

  selecionadas.forEach(numeroRifa => {
    const participante = {
      nome,
      telefone,
      endereco,
      numeroRifa
    };

    participantes.push(participante);
    // Adiciona participante ao Firestore
    db.collection("participantes").add(participante)
      .then(() => {
        console.log("Participante adicionado com sucesso!");
      })
      .catch(error => {
        console.error("Erro ao adicionar participante: ", error);
      });
  });

  selecionadas = []; // Limpa as rifas selecionadas
  atualizarLista();
  limparCampos();
}

// Função para resetar o banco de dados
function resetarBanco() {
  if (confirm("Tem certeza que deseja resetar todas as rifas?")) {
    db.collection("participantes").get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          doc.ref.delete();
        });
      })
      .then(() => {
        participantes = [];
        atualizarLista();
      })
      .catch(error => {
        console.error("Erro ao resetar banco: ", error);
      });
  }
}

// Função para realizar o sorteio
function realizarSorteio() {
  if (participantes.length === 0) {
    alert("Não há participantes para realizar o sorteio.");
    return;
  }

  let rifaSorteada = participantes[Math.floor(Math.random() * participantes.length)];
  alert(`A rifa sorteada foi: ${rifaSorteada.numeroRifa}, Nome: ${rifaSorteada.nome}`);
  atualizarLista();
}

// Função para atualizar a lista de rifas
function atualizarLista() {
  db.collection("participantes").get()
    .then(querySnapshot => {
      participantes = querySnapshot.docs.map(doc => doc.data());
      gerarTabelaRifas();
    })
    .catch(error => {
      console.error("Erro ao atualizar lista: ", error);
    });
}

// Função para limpar campos
function limparCampos() {
  document.getElementById('nome').value = '';
  document.getElementById('telefone').value = '';
  document.getElementById('endereco').value = '';
}

// Evento DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  atualizarLista();
});
